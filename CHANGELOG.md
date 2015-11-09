# Change Log
All notable changes to this project will be documented in this file.
This project tries to adhere to [Semantic Versioning](http://semver.org/).

## Unreleased
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
