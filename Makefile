UUID              = inputmethod-shortcuts@osamu.debian.org
EXTENSIONS_PATH   = ~/.local/share/gnome-shell/extensions
INSTALL_PATH      = $(EXTENSIONS_PATH)/$(UUID)
FILES             = README.md \
		    LICENSE \
		    extension.js \
		    metadata.json \
		    schemas/

.PHONY: all build zip repo install
all: zip

build:
	glib-compile-schemas --strict --targetdir=schemas/ schemas

zip: build
	rm -f $(UUID).zip
	zip -r $(UUID).zip $(FILES)

repo: zip
	git commit -a

install: build
	rm -rf $(INSTALL_PATH)
	mkdir -p $(INSTALL_PATH)
	cp -r $(FILES) $(INSTALL_PATH)/

# vim: set ts=8:
