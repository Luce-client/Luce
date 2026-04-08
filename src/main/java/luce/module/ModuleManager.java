package luce.module;

import java.util.ArrayList;
import java.util.List;

public class ModuleManager {
    private List<Module> modules = new ArrayList<>();

    public void init() {
        // Register default modules
        modules.add(new Module("FPS Enhancer", "Boosts frames significantly by altering rendering pipelines.") {
            @Override
            public void onEnable() {
                // Remove fog, disable unseen entity renders, etc. (Implemented via ASM/Render mixins logically)
                System.out.println("[Luce Engine] FPS Enhancer Enabled!");
            }
        });
        
        // Enabling default optimizations
        for (Module m : modules) {
            m.setToggled(true);
        }
    }

    public List<Module> getModules() {
        return modules;
    }
}
