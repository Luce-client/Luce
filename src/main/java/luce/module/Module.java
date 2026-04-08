package luce.module;

public class Module {
    public String name;
    public String description;
    public boolean toggled;

    public Module(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public void toggle() {
        this.toggled = !this.toggled;
        if(toggled) {
            onEnable();
        } else {
            onDisable();
        }
    }

    public void setToggled(boolean toggled) {
        this.toggled = toggled;
        if (toggled) onEnable();
        else onDisable();
    }

    public void onEnable() {}
    public void onDisable() {}
}
