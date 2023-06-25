UUID              = inputmethod-shortcuts@osamu.debian.org
EXTENSIONS_PATH   = ~/.local/share/gnome-shell/extensions
INSTALL_PATH      = $(EXTENSIONS_PATH)/$(UUID)
FILES             = README.md \
		    extension.js \
		    metadata.json \
		    schemas/

.PHONY: all build install
all: build

build:
	glib-compile-schemas --strict --targetdir=schemas/ schemas
	zip -r $(UUID).zip $(FILES)

install: all
	rm -rf $(INSTALL_PATH)
	mkdir -p $(INSTALL_PATH)
	cp -r $(FILES) $(INSTALL_PATH)/

# vim: set ts=8:
