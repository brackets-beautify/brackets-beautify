# Change Log
All notable changes to this project will be documented in this file.
This project tries to adhere to [Semantic Versioning](http://semver.org/).


## 2.4.0 - 2017-02-26
### Added
- Format JSX as JavaScript (see [#234](https://github.com/brackets-beautify/brackets-beautify/issues/234))

### Changed
- Updated js-beautify to version 1.6.11 (see [#235](https://github.com/brackets-beautify/brackets-beautify/issues/235))
- Extend language-beautifier mapping instead of replacing it


## 2.3.0 - 2016-09-04
### Added
- Farsi (Persian) Translation

### Changed
- Updated Italian Translation
- Updated js-beautify to version 1.6.4


## 2.2.0 - 2016-06-12
### Added
- Configure any program to beautify a language

### Removed
- Explicit SASS settings as they can be handled by generic mechanism


## 2.1.0 - 2016-06-11
### Added
- Chinese (simplified) translation, thanks to [__@quarkchaos__](https://github.com/quarkchaos)
- Romanian translation, thanks to [__@Mitroo__](https://github.com/Mitroo)
- Basic support for Vue component files
- Toolbar Button to Beautify

### Changed
- Updated js-beautify to version 1.6.3
- Require Brackets 1.7.0


## 2.0.0 - 2015-11-24
### Added
- Use Brackets Preferences language and path layer to configure `Beautify on save`
- Enable use of nested settings from `.jsbeautifyrc`
- Provide settings to *css_beautify*
- Format SVG as HTML
- Define preference with description

### Changed
- Only change document if beautified text looks different
- Turned on `end_with_newline` option by default
- Merge options file with default

### Removed
- Fake French translation
- `git_happy` option as it is identical to `end_with_newline`

### Fixed
- LivePreview duplication (see [#49](https://github.com/brackets-beautify/brackets-beautify/issues/49))
- Key Binding on Linux


## 1.2.0 - 2015-08-11
### Changed
- Updated js-beautify to version 1.5.10
