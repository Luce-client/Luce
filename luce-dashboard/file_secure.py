import os
from cryptography.fernet import Fernet

# --- 키 저장 경로 설정 (사용자 요청: AppData\Roaming) ---
# Windows의 표준 앱 데이터 저장소인 AppData\Roaming 경로를 가져옵니다.
APPDATA_PATH = os.getenv('APPDATA')
KEY_DIR = os.path.join(APPDATA_PATH, 'SecureSafe') # 'SecureSafe'라는 전용 폴더 이름 사용
KEY_PATH = os.path.join(KEY_DIR, 'secret.key')

def ensure_key_dir():
    """키가 저장될 전용 폴더가 없으면 생성합니다."""
    if not os.path.exists(KEY_DIR):
        os.makedirs(KEY_DIR)

def generate_key():
    """암호화에 사용할 키를 생성하고 APPDATA 폴더에 저장합니다."""
    ensure_key_dir()
    
    if os.path.exists(KEY_PATH):
        choice = input(f"[주의] 이미 키 파일이 존재합니다. 새로 만드시겠습니까?\n(기존 암호화 파일을 열지 못하게 될 수 있습니다) (y/n): ")
        if choice.lower() != 'y':
            print("키 생성을 취소합니다.")
            return

    key = Fernet.generate_key()
    with open(KEY_PATH, "wb") as key_file:
        key_file.write(key)
    print(f"\n[성공] 키가 생성되었습니다.\n저장 위치: {KEY_PATH}")

def load_key():
    """저장된 키 파일을 불러옵니다."""
    if not os.path.exists(KEY_PATH):
        return None
    return open(KEY_PATH, "rb").read()

def encrypt_file():
    """사용자가 입력한 파일을 암호화합니다."""
    key = load_key()
    if not key:
        print("\n[오류] 열쇠가 없습니다. 먼저 1번 메뉴에서 키를 생성하세요.")
        return

    file_path = input("암호화할 파일 경로나 이름을 입력하세요: ").strip()
    
    if not os.path.exists(file_path):
        print(f"\n[오류] '{file_path}' 파일을 찾을 수 없습니다.")
        return

    if file_path.endswith(".encrypted"):
        print("\n[주의] 이 파일은 이미 암호화된 파일로 보입니다.")
        return

    try:
        f = Fernet(key)
        with open(file_path, "rb") as file:
            file_data = file.read()
        
        encrypted_data = f.encrypt(file_data)
        
        new_file_path = file_path + ".encrypted"
        with open(new_file_path, "wb") as file:
            file.write(encrypted_data)
        
        print(f"\n[성공] 암호화 완료: {new_file_path}")
    except Exception as e:
        print(f"\n[실패] 암호화 오류: {e}")

def decrypt_file():
    """암호화된 파일을 복구합니다."""
    key = load_key()
    if not key:
        print("\n[오류] 열쇠(secret.key)를 찾을 수 없습니다. 원래의 키가 필요합니다.")
        return

    file_path = input("복구할 파일명(.encrypted 포함)을 입력하세요: ").strip()

    if not os.path.exists(file_path):
        print(f"\n[오류] '{file_path}' 파일을 찾을 수 없습니다.")
        return

    try:
        f = Fernet(key)
        with open(file_path, "rb") as file:
            encrypted_data = file.read()
        
        decrypted_data = f.decrypt(encrypted_data)
        
        original_file_path = file_path.replace(".encrypted", "")
        with open(original_file_path, "wb") as file:
            file.write(decrypted_data)
        
        print(f"\n[성공] 복구 완료: {original_file_path}")
    except Exception as e:
        print(f"\n[실패] 복구 오류 (키가 다르거나 파일이 손상됨): {e}")

def main_menu():
    """프로그램 메인 메뉴 루프"""
    while True:
        print("\n" + "="*40)
        print("   나의 보안 금고 (AppData 기반)")
        print("="*40)
        print(f" 현재 키 경로: {KEY_PATH}")
        print("-"*40)
        print("1. 암호화 열쇠 생성 (AppData에 저장)")
        print("2. 파일 암호화 (잠금)")
        print("3. 파일 복구 (열기)")
        print("4. 종료")
        print("="*40)
        
        choice = input("작업 번호 선택: ").strip()
        
        if choice == '1':
            generate_key()
        elif choice == '2':
            encrypt_file()
        elif choice == '3':
            decrypt_file()
        elif choice == '4':
            print("프로그램을 종료합니다.")
            break
        else:
            print("\n[알림] 잘못된 입력입니다.")

if __name__ == "__main__":
    main_menu()
