AppLauncher
==============================

AppLauncher is an extension of Firefox. This enable you to
launch an external application through the context menu of Firefox.

Installation
------------------------------

If you'd like to install this extension to your firefox, please go to
the Add-ons site:

* Japanese - https://addons.mozilla.org/ja/firefox/addon/applauncher/
* English  - https://addons.mozilla.org/en-US/firefox/addon/applauncher/

Build
------------------------------

### Prerequisites

* [Ruby](http://www.ruby-lang.org/)
  * [bundler](http://rubygems.org/gems/bundler) (Ruby gem)
* [tsc command](http://www.typescriptlang.org/) (TypeScript compiler)

### Set up

Install gems:

```
bundle install
```

### Build

```
bundle exec rake
```

License
------------------------------

AppLauncher is released under [the MIT License](http://opensource.org/licenses/mit-license.php).
