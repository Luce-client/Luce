import { BrowserWindow } from 'electron';

const CLIENT_ID = '00000000402b5328';
const REDIRECT_URI = 'https://login.live.com/oauth20_desktop.srf';

// ==========================================
// Method 1: Popup Window Login (+ Microsoft 계정)
// ==========================================
const AUTH_URL = `https://login.live.com/oauth20_authorize.srf?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=XboxLive.signin%20offline_access&prompt=select_account`;

// ==========================================
// Method 2: Device Code / Link Login (+ Microsoft 계정 링크)
// ==========================================
const DEVICE_CODE_URL = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/devicecode';
const TOKEN_URL = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token';
const DEVICE_CLIENT_ID = '00000000402b5328';

export interface DeviceCodeInfo {
    userCode: string;
    verificationUri: string;
    deviceCode: string;
    expiresIn: number;
    interval: number;
}

export class AuthManager {

    // ===== METHOD 1: POPUP LOGIN =====
    static async loginMicrosoft(mainWindow: BrowserWindow): Promise<any> {
        const code = await this.getAuthCode(mainWindow);
        console.log('[AuthManager] Got auth code, exchanging for token...');
        const msToken = await this.exchangeCodeForToken(code);
        console.log('[AuthManager] Got MS token, authenticating with Xbox...');
        const mcProfile = await this.minecraftAuthFlow(msToken);
        console.log('[AuthManager] Login success:', mcProfile.name);
        return mcProfile;
    }

    // ===== METHOD 2: DEVICE CODE (LINK) LOGIN =====
    static async startDeviceCodeFlow(): Promise<DeviceCodeInfo> {
        const body = new URLSearchParams({
            client_id: DEVICE_CLIENT_ID,
            scope: 'XboxLive.signin offline_access',
        });

        const res = await fetch(DEVICE_CODE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Device code request failed: ${res.status} ${text}`);
        }

        const data = await res.json();
        return {
            userCode: data.user_code,
            verificationUri: data.verification_uri,
            deviceCode: data.device_code,
            expiresIn: data.expires_in,
            interval: data.interval || 5,
        };
    }

    static async pollDeviceCodeToken(deviceCode: string, interval: number, expiresIn: number): Promise<any> {
        const startTime = Date.now();
        const timeout = expiresIn * 1000;

        while (Date.now() - startTime < timeout) {
            await this.sleep(interval * 1000);

            const body = new URLSearchParams({
                client_id: DEVICE_CLIENT_ID,
                grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
                device_code: deviceCode,
            });

            const res = await fetch(TOKEN_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: body.toString(),
            });

            const data = await res.json();

            if (data.access_token) {
                console.log('[AuthManager] Device code auth success, got MS token');
                const mcProfile = await this.minecraftAuthFlow(data.access_token);
                console.log('[AuthManager] Login success:', mcProfile.name);
                return mcProfile;
            }

            if (data.error === 'authorization_pending') {
                // User hasn't authenticated yet, keep polling
                continue;
            }

            if (data.error === 'slow_down') {
                interval += 5; // Increase polling interval
                continue;
            }

            if (data.error === 'expired_token') {
                throw new Error('Device code expired. Please try again.');
            }

            // Other errors
            throw new Error(`Device code poll error: ${data.error} - ${data.error_description}`);
        }

        throw new Error('Device code flow timed out.');
    }

    // ===== INTERNAL: Popup auth helpers =====
    private static getAuthCode(mainWindow: BrowserWindow): Promise<string> {
        return new Promise((resolve, reject) => {
            const authWindow = new BrowserWindow({
                width: 520, height: 680,
                show: true, parent: mainWindow, modal: true,
                title: 'Microsoft Login - Luce Client',
                webPreferences: { nodeIntegration: false, contextIsolation: true },
            });

            authWindow.setMenuBarVisibility(false);
            authWindow.loadURL(AUTH_URL);

            authWindow.webContents.on('will-redirect', (event, url) => {
                this.handleRedirect(url, authWindow, resolve, reject);
            });
            authWindow.webContents.on('will-navigate', (event, url) => {
                this.handleRedirect(url, authWindow, resolve, reject);
            });
            authWindow.on('closed', () => {
                reject(new Error('Auth window was closed by user.'));
            });
        });
    }

    private static handleRedirect(url: string, authWindow: BrowserWindow, resolve: (code: string) => void, reject: (err: Error) => void) {
        if (!url.startsWith(REDIRECT_URI)) return;
        const urlObj = new URL(url);
        const code = urlObj.searchParams.get('code');
        const error = urlObj.searchParams.get('error');
        if (code) {
            authWindow.removeAllListeners('closed');
            authWindow.close();
            resolve(code);
        } else if (error) {
            authWindow.removeAllListeners('closed');
            authWindow.close();
            reject(new Error(`MS Auth error: ${error}`));
        }
    }

    private static async exchangeCodeForToken(code: string): Promise<string> {
        const body = new URLSearchParams({
            client_id: CLIENT_ID, code, grant_type: 'authorization_code', redirect_uri: REDIRECT_URI,
        });
        const res = await fetch('https://login.live.com/oauth20_token.srf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
        });
        if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
        const data = await res.json();
        return data.access_token;
    }

    // ===== INTERNAL: Xbox → XSTS → Minecraft =====
    private static async minecraftAuthFlow(msToken: string) {
        // 1. Xbox Live
        const xblRes = await fetch('https://user.auth.xboxlive.com/user/authenticate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                Properties: { AuthMethod: 'RPS', SiteName: 'user.auth.xboxlive.com', RpsTicket: 'd=' + msToken },
                RelyingParty: 'http://auth.xboxlive.com', TokenType: 'JWT',
            }),
        });
        if (!xblRes.ok) throw new Error(`Xbox Live auth failed: ${xblRes.status}`);
        const xblData = await xblRes.json();
        const xblToken = xblData.Token;
        const uhs = xblData.DisplayClaims.xui[0].uhs;

        // 2. XSTS
        const xstsRes = await fetch('https://xsts.auth.xboxlive.com/xsts/authorize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                Properties: { SandboxId: 'RETAIL', UserTokens: [xblToken] },
                RelyingParty: 'rp://api.minecraftservices.com/', TokenType: 'JWT',
            }),
        });
        if (!xstsRes.ok) throw new Error(`XSTS auth failed: ${xstsRes.status}`);
        const xstsData = await xstsRes.json();

        // 3. Minecraft Token
        const mcRes = await fetch('https://api.minecraftservices.com/authentication/login_with_xbox', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identityToken: `XBL3.0 x=${uhs};${xstsData.Token}` }),
        });
        if (!mcRes.ok) throw new Error(`MC auth failed: ${mcRes.status}`);
        const mcData = await mcRes.json();

        // 4. Profile
        const profileRes = await fetch('https://api.minecraftservices.com/minecraft/profile', {
            headers: { Authorization: `Bearer ${mcData.access_token}` },
        });
        if (!profileRes.ok) throw new Error(`MC profile failed: ${profileRes.status}`);
        const profileData = await profileRes.json();

        return { uuid: profileData.id, name: profileData.name, accessToken: mcData.access_token };
    }

    private static sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
