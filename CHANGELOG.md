# Change Log
All notable changes to this project will be documented in this file.
This project tries to adhere to [Semantic Versioning](http://semver.org/).


## Unreleased
### Changed
- Updated `js-beautify` to version 1.13.13

## Fixed
- No inline tags in xml (see [#303](https://github.com/brackets-beautify/brackets-beautify/issues/303))


## 2.12.0 - 2020-09-06
### Changed
- Updated `js-beautify` to version 1.13.0


## 2.11.0 - 2020-04-21
### Changed
- Updated `js-beautify` to version 1.11.0


## 2.10.0 - 2020-01-29
### Added
- French Translation, thanks to [__@WellBaik__](https://github.com/WellBaik)

### Changed
- Updated `js-beautify` to version 1.10.3


## 2.9.3 - 2019-10-04
### Changed
- Updated `js-beautify` to version 1.10.2


## 2.9.2 - 2019-07-17
### Changed
- Updated `js-beautify` to version 1.10.1


## 2.9.1 - 2019-06-06
### Fixed
- Set `templating`-option to document language if possible (see [#284](https://github.com/brackets-beautify/brackets-beautify/issues/284))


## 2.9.0 - 2019-05-01
### Changed
- Updated `js-beautify` to version 1.10.0


## 2.8.0 - 2019-03-30
### Added
- Portuguese (Brazilian) Translation, thanks to [__@ArturGuedes__](https://github.com/ArturGuedes)

### Changed
- Updated `js-beautify` to version 1.9.1


## 2.7.1 - 2019-03-15
### Fixed
- Handling of JS containing HTML tags inside HTML documents during Live Preview (see [#277](https://github.com/brackets-beautify/brackets-beautify/issues/277))


## 2.7.0 - 2019-02-28
### Changed
- Updated `js-beautify` to version 1.9.0


## 2.6.4 - 2019-02-13
### Changed
- Updated `js-beautify` to version 1.8.9


## 2.6.3 - 2018-10-18
### Changed
- Updated `js-beautify` to version 1.8.8


## 2.6.2 - 2018-10-05
### Changed
- Updated `js-beautify` to version 1.8.6

### Fixed
- Attempted fix to save-loop by checking if document is being saved (see [#199](https://github.com/brackets-beautify/brackets-beautify/issues/199))


## 2.6.1 - 2018-08-27
### Changed
- Updated `js-beautify` to version 1.8.1


## 2.6.0 - 2018-08-27
### Changed
- Updated `js-beautify` to version 1.8.0


## 2.5.2 - 2018-05-20
### Changed
- Updated `js-beautify` to version 1.7.5


## 2.5.1 - 2017-11-30
### Changed
- Updated `js-beautify` to version 1.7.4


## 2.5.0 - 2017-09-24
### Changed
- Updated `js-beautify` to version 1.7.3


## 2.4.1 - 2017-07-07
### Changed
- Updated `js-beautify` to version 1.6.14

### Fixed
- Support Brackets-Electron by requesting LiveDevelopment conditionally (see [#246](https://github.com/brackets-beautify/brackets-beautify/issues/246))


## 2.4.0 - 2017-02-26
### Added
- Format JSX as JavaScript (see [#234](https://github.com/brackets-beautify/brackets-beautify/issues/234))

### Changed
- Updated `js-beautify` to version 1.6.11 (see [#235](https://github.com/brackets-beautify/brackets-beautify/issues/235))
- Extend language-beautifier mapping instead of replacing it


## 2.3.0 - 2016-09-04
### Added
- Farsi (Persian) Translation, thanks to [__@Rezaaa__](https://github.com/Rezaaa)

### Changed
- Updated Italian Translation, thanks to [__@Denisov21__](https://github.com/Denisov21)
- Updated `js-beautify` to version 1.6.4


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
- Updated `js-beautify` to version 1.6.3
- Require Brackets 1.7.0


## 2.0.0 - 2015-11-24
### Added
- Use Brackets Preferences language and path layer to configure `Beautify on save`
- Enable use of nested settings from `.jsbeautifyrc`
- Provide settings to `css_beautify`
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
- Updated `js-beautify` to version 1.5.10
