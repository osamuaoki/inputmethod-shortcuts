# release guide
#     * run "make zip"
#     * open browser: https://extensions.gnome.org/upload/
#     * upload zip file

UUID              = inputmethod-shortcuts@osamu.debian.org
EXTENSIONS_PATH   = ~/.local/share/gnome-shell/extensions
INSTALL_PATH      = $(EXTENSIONS_PATH)/$(UUID)
FILES             = README.md \
		    LICENSE \
		    extension.js \
		    metadata.json \
		    prefs.js \
		    schemas/

.PHONY: all build zip repo install clean
all: build

build:
	glib-compile-schemas --strict --targetdir=schemas/ schemas

zip: build
	rm -f $(UUID).zip
	zip -r $(UUID).zip $(FILES)

install: build
	rm -rf $(INSTALL_PATH)
	mkdir -p $(INSTALL_PATH)
	cp -r $(FILES) $(INSTALL_PATH)/

# use_markup is not supported GNOME 40-42
backport:
	sed -i -E -e 's/, *use_markup *: *true//' -e 's/<\/?i>//g' -e 's/<\/?b>//g' -e 's/<a.*">//g' -e 's/<\/a>//g'  prefs.js
	sed -i -E -e 's/^.*shell-version.*$$/  "shell-version": [ "40", "41", "42" ],/' metadata.json

clean:
	rm -f $(UUID).zip
	rm -f schemas/gschemas.compiled
# vim: set ts=8:
