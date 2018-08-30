const { Plugin } = require('@uppy/core')
const toArray = require('@uppy/utils/lib/toArray')
const Translator = require('@uppy/utils/lib/Translator')
const React = require('preact')
require('./style.less')

module.exports = class DirUploader extends Plugin {
  constructor(uppy, opts) {
    super(uppy, opts)
    this.id = this.opts.id || 'DirUploader'
    this.title = 'Directory Up'
    this.type = 'acquirer'

    const defaultLocale = {
      strings: {
        chooseFiles: 'Choose directory'
      }
    }

    // Default options
    const defaultOptions = {
      target: null,
      pretty: true,
      inputName: 'files[]',
      locale: defaultLocale
    }

    // Merge default options with the ones set by user
    this.opts = Object.assign({}, defaultOptions, opts)

    this.locale = Object.assign({}, defaultLocale, this.opts.locale)
    this.locale.strings = Object.assign(
      {},
      defaultLocale.strings,
      this.opts.locale.strings
    )

    // i18n
    this.translator = new Translator({ locale: this.locale })
    this.i18n = this.translator.translate.bind(this.translator)

    this.render = this.render.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  handleInputChange(ev) {
    this.uppy.log('[FileInput] Something selected through input...')

    const files = toArray(ev.target.files)

    files.forEach(file => {
      try {
        console.log('file', file)
        this.uppy.addFile({
          source: this.id,
          name: file.webkitRelativePath || file.name,
          type: file.type,
          data: file
        })
      } catch (err) {
        // Nothing, restriction errors handled in Core
      }
    })

    const Dashboard = this.uppy.getPlugin('Dashboard')
    if (Dashboard && typeof Dashboard.hideAllPanels === 'function') {
      Dashboard.hideAllPanels()
    }
  }

  handleClick(ev) {
    this.dirInput.click()
  }

  render(state) {
    /* http://tympanus.net/codrops/2015/09/15/styling-customizing-file-inputs-smart-way/ */
    const hiddenInputStyle = {
      width: '0.1px',
      height: '0.1px',
      opacity: 0,
      overflow: 'hidden',
      position: 'absolute',
      zIndex: -1
    }

    const restrictions = this.uppy.opts.restrictions

    // empty value="" on file input, so that the input is cleared after a file is selected,
    // because Uppy will be handling the upload and so we can select same file
    // after removing — otherwise browser thinks it’s already selected
    return (
      <div className="uppy-Root uppy-FileInput-container">
        <input
          className="uppy-FileInput-input"
          style={this.opts.pretty && hiddenInputStyle}
          type="file"
          name={this.opts.inputName}
          onChange={this.handleInputChange}
          multiple={restrictions.maxNumberOfFiles !== 1}
          accept={restrictions.allowedFileTypes}
          directory={true}
          webkitDirectory={true}
          ref={input => {
            this.dirInput = input
          }}
          value=""
        />
        {this.opts.pretty && (
          <button
            className="uppy-FileInput-btn"
            type="button"
            onClick={this.handleClick}
          >
            {this.i18n('chooseFiles')}
          </button>
        )}
      </div>
    )
  }

  install() {
    const target = this.opts.target
    if (target) {
      this.mount(target, this)
    }
  }

  uninstall() {
    this.unmount()
  }
}
