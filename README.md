# Clear Unused Excalidraw Files Plugin

**Clear Unused Excalidraw Files** is an Obsidian plugin designed to automatically detect and remove Excalidraw files that are not embedded anywhere in your vault. It helps keep your vault tidy by clearing out unused drawings.

## Features

- **Automatic Detection:** Scans your vault for Excalidraw files located in a specified folder.
- **Unused File Deletion:** Identifies Excalidraw files that are not referenced (via wiki-links or transclusions) in any markdown or canvas files.
- **Adjustable Target Folder:** Specify the folder where your embedded Excalidraw files are stored.
- **Excluded Subfolders:** Exclude specific subfolders (one per line) within the target folder from deletion.
- **Custom Deletion Method:** Choose whether to permanently delete files, move them to the Obsidian trash, or use the system trash.
- **Optional Ribbon Icon:** Enable a ribbon icon for quick access to the clear command.

## Usage

- **Run via Command Palette:**
    - Open the Command Palette (usually `Ctrl+P` or `Cmd+P`) and search for **"Clear Unembedded Excalidraw Files"**.
- **Ribbon Icon (Optional):**
    - If enabled in settings, click the ribbon icon to run the command.

## Adjustable Settings

Within the plugin settings, you can configure the following:

- **Ribbon Icon:**  
    Toggle to show or hide a ribbon icon in the sidebar for quick access.
    
- **Deleted File Destination:**  
    Choose how you want the unused Excalidraw files to be handled:
    
    - **Delete Permanently**
    - **Move to Obsidian Trash**
    - **Move to System Trash**
- **Embedded Excalidrawings Folder:**  
    Specify the folder where your Excalidraw files are stored (e.g., `vault/Excalidraw/`).  
    _This is the folder that will be scanned for files to potentially clear._
    
- **Excluded Subfolders:**  
    Enter each subfolder name on a separate line. Files in these subfolders will be **excluded** from deletion (case-sensitive).  
    _For example, if you want to exclude a subfolder called "Archive", simply enter "Archive" on its own line._
    

## How It Works

1. **File Filtering:**  
    The plugin scans your vault and filters for Excalidraw files that are stored in the specified folder.  
    Since your files are stored with a real extension of `.excalidraw.md` (but display as `.excalidraw`), the plugin checks both the file name ending and the file's basename.
    
2. **Exclusion Filtering:**  
    After gathering the candidate files, the plugin further excludes any files located in subfolders specified in the **Excluded Subfolders** setting.
    
3. **Usage Detection:**  
    The plugin then reads through all markdown and canvas files in your vault. It marks an Excalidraw file as "used" if it finds:
    
    - A link in the form `[[<basename>]]`
    - A transclusion like `![[<basename>]]`
    - The full file path
4. **Deletion:**  
    Any Excalidraw file not referenced anywhere is then deleted (or moved) according to your chosen deletion method. A notification is displayed with the results.
