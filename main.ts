"use strict";

var e = require("obsidian");

const DEFAULT_SETTINGS = {
    deleteOption: ".trash", // Options: ".trash", "system-trash", "permanent"
    logsModal: true,
    excludedFolders: "",
    ribbonIcon: false,
    excludeSubfolders: false,
};

class ClearUnusedExcalidrawSettingsTab extends e.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        let { containerEl: t } = this;
        t.empty();
        t.createEl("h2", { text: "Clear Unused Excalidraw Settings" });
    
        new e.Setting(t)
            .setName("Ribbon Icon")
            .setDesc("Enable to show a ribbon icon for clearing unused Excalidraw files.")
            .addToggle((e) =>
                e.setValue(this.plugin.settings.ribbonIcon).onChange((val) => {
                    this.plugin.settings.ribbonIcon = val;
                    this.plugin.saveSettings();
                    this.plugin.refreshIconRibbon();
                })
            );
    
        new e.Setting(t)
            .setName("Deleted File Destination")
            .setDesc("Choose where to move deleted Excalidraw files.")
            .addDropdown((e) => {
                e.addOption("permanent", "Delete Permanently");
                e.addOption(".trash", "Move to Obsidian Trash");
                e.addOption("system-trash", "Move to System Trash");
                e.setValue(this.plugin.settings.deleteOption);
                e.onChange((val) => {
                    this.plugin.settings.deleteOption = val;
                    this.plugin.saveSettings();
                });
            });
    
        new e.Setting(t)
            .setName("Embedded Excalidrawings Folder")
            .setDesc("Enter a specified folder for Excalidraw file detection, where embedded files are stored (e.g., vault/Excalidraw/)")
            .addText((text) =>
                text
                    .setValue(this.plugin.settings.excalidrawFolder)
                    .onChange((val) => {
                        this.plugin.settings.excalidrawFolder = val;
                        this.plugin.saveSettings();
                    })
            );
    
        new e.Setting(t)
            .setName("Excluded Subfolders")
            .setDesc("Enter each subfolder name on a separate line. Files in these subfolders will be excluded from deletion (case-sensitive).")
            .addTextArea((text) =>
                text
                    .setValue(this.plugin.settings.excludedSubfolders)
                    .onChange((val) => {
                        this.plugin.settings.excludedSubfolders = val;
                        this.plugin.saveSettings();
                    })
            );
    }
    
}

class ClearUnusedExcalidrawPlugin extends e.Plugin {
    async onload() {
        console.log("Clear Unused Excalidraw plugin loaded...");
        await this.loadSettings();
        this.addSettingTab(new ClearUnusedExcalidrawSettingsTab(this.app, this));

        this.addCommand({
            id: "clear-unused-excalidraw",
            name: "Clear Unembedded Excalidraw Files",
            callback: () => this.clearUnusedExcalidrawFiles(),
        });

        this.refreshIconRibbon();
    }

    refreshIconRibbon() {
        if (this.settings.ribbonIcon) {
            this.ribbonIconEl = this.addRibbonIcon("eraser", "Clear Unused Excalidraw Files", () => {
                this.clearUnusedExcalidrawFiles();
            });
        }
    }

async clearUnusedExcalidrawFiles() {
    const files = this.app.vault.getFiles();
    const usedFiles = new Set();
    // Filter for Excalidraw files in the adjustable folder
    const allExcalidrawFiles = files.filter((file) =>
        (file.name.endsWith(".excalidraw.md") || file.basename.endsWith(".excalidraw")) &&
        file.path.includes(this.settings.excalidrawFolder)
    );

    // Parse the excluded subfolders setting (each line is a separate entry)
    const excludedSubfolders = this.settings.excludedSubfolders
    ? this.settings.excludedSubfolders.split("\n").map(s => s.trim()).filter(s => s.length > 0)
    : [];


    // Further filter out files that are in any excluded subfolder
    const filteredExcalidrawFiles = allExcalidrawFiles.filter(file => {
        return !excludedSubfolders.some(subfolder => file.path.includes(subfolder));
    });

    console.log("All Excalidraw files:", allExcalidrawFiles.map(f => f.path));
    console.log("Filtered Excalidraw files (after exclusions):", filteredExcalidrawFiles.map(f => f.path));

    // Identify used Excalidraw files by scanning markdown and canvas files.
    for (const file of files) {
        if (file.extension === "md" || file.extension === "canvas") {
            const content = await this.app.vault.read(file);
            for (const excalidrawFile of filteredExcalidrawFiles) {
                const baseName = excalidrawFile.basename; // e.g., "20250223_205657.excalidraw"
                const fullPath = excalidrawFile.path;
                if (
                    content.includes(`[[${baseName}]]`) ||
                    content.includes(`![[${baseName}]]`) ||
                    content.includes(fullPath)
                ) {
                    usedFiles.add(fullPath);
                }
            }
        }
    }

    // Delete unused Excalidraw files
    let deletedCount = 0;
    let logText = "";
    for (const file of filteredExcalidrawFiles) {
        if (!usedFiles.has(file.path)) {
            await this.app.vault.trash(file, this.settings.deleteOption !== "permanent");
            logText += `Deleted: ${file.path}\n`;
            deletedCount++;
        }
    }

    if (deletedCount > 0) {
        new e.Notice(logText);
    } else {
        new e.Notice("No unused Excalidraw files found.");
    }
}

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

module.exports = ClearUnusedExcalidrawPlugin;