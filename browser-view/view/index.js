/**
 * @file index.js
 * @author Cuttle Cong
 * @date 2018/8/24
 * @description
 */

import * as React from 'react'
import { render } from 'react-dom'
import Clipboard from 'react-copy-to-clipboard'
import { stringify, parse } from 'querystring'
import cn from 'classnames'
import * as u from 'url'
import join from 'url-join'
import {
  observable,
  storageSync,
  bindView,
  stateless,
  computed,
  binding,
  bindable,
  DEFAULT_OPTIONS,
  Root,
  autorun,
  h
} from 'react-mobx-vm'
import registerUppy from './registerUppy'

bindable(
  [
    {
      cond: props => {
        return props.type === 'checkbox'
      },
      prop: ['checked'],
      event: [
        [
          'onChange',
          function([evt]) {
            return evt.target.checked
          }
        ]
      ]
    }
  ].concat(DEFAULT_OPTIONS),
  'input'
)

@binding
class View extends React.Component {
  state = {
    copied: false
  }

  get permaLink() {
    let obj = u.parse(location.href, true)
    return u.format({
      ...obj,
      search: null,
      query: {
        ...obj.query,
        ...this.local.toJSON()
      }
    })
  }

  onCopy = () => {
    clearTimeout(this._t)
    this.setState({ copied: true }, () => {
      this._t = setTimeout(() => {
        this.setState({ copied: false })
      }, 2000)
    })
  }

  handleUploadDir = evt => {
    // this.uploadDirDom
  }

  render() {
    return (
      <div>
        <div style={{ position: 'relative' }}>
          <h1 className="title clearfix">Fileman UI</h1>

          <div style={{ position: 'absolute', top: 0, right: 0 }}>
            <Clipboard text={this.permaLink} onCopy={this.onCopy}>
              <button
                type="button"
                className={cn(
                  'btn btn-sm btn-default',
                  this.state.copied && 'text-success'
                )}
                aria-label="Left Align"
              >
                <span className="glyphicon glyphicon-copy" aria-hidden="true" />
                <span style={{ marginLeft: 5, display: 'inline-block' }}>
                  {this.state.copied ? 'Copied' : 'Copy Link'}
                </span>
              </button>
            </Clipboard>
            <a
              style={{ marginLeft: 10 }}
              className={'btn btn-sm btn-default'}
              href={'https://github.com/imcuttle/express-restful-fileman'}
            >
              GitHub
            </a>
          </div>
        </div>
        <p className="bg-danger hidden" id="alert-msg">
          ...
        </p>
        {this.local.serverUrlVisible && (
          <div className="form-group row">
            <div className="col-sm-12">
              <input
                data-bind="serverUrl"
                type="text"
                autoComplete="off"
                spellCheck="false"
                className="form-control"
                name="serverUrl"
                placeholder="Fileman's server url"
              />
            </div>
          </div>
        )}
        <div className="form-group row">
          <div className="col-sm-6">
            <label htmlFor="token">Token:</label>
            <input
              data-bind="token"
              type="text"
              autoComplete="off"
              spellCheck="false"
              className="form-control"
              name="namespace"
              placeholder=""
            />
          </div>
          <div className="col-sm-6">
            <label htmlFor="namespace">Namespace:</label>
            <input
              data-bind="namespace"
              type="text"
              autoComplete="off"
              spellCheck="false"
              className="form-control"
              name="namespace"
              placeholder="eg. /root/abc"
            />
          </div>
        </div>
        <div className="form-group row">
          <div className="col-xs-6">
            <label style={{ marginRight: 10 }}>Push force</label>
            <label className="checkbox-inline">
              <input type="checkbox" data-bind="force" name="force" />Yes?
            </label>
          </div>
          <div className="col-xs-6">
            <label style={{ marginRight: 10 }}>Decompress</label>
            <label className="checkbox-inline">
              <input type="checkbox" data-bind="decompress" name="decompress" />Yes?
            </label>
          </div>
        </div>
      </div>
    )
  }
}

@bindView(View)
class App extends Root {
  // @storageSync
  @observable token = ''

  @storageSync
  @observable
  namespace = ''

  @storageSync
  @observable
  force = false

  @storageSync
  @observable
  decompress = false

  @observable
  dirFiles = []

  // @storageSync
  @observable serverUrl = location.origin + location.pathname

  serverUrlVisible = false

  @computed
  get query() {
    return {
      force: this.force,
      decompress: this.decompress
    }
  }

  init() {
    let query = parse(location.search.slice(1)) || {}

    if (typeof query.force === 'string') {
      query.force = query.force === 'true'
    }
    if (typeof query.decompress === 'string') {
      query.decompress = query.decompress === 'true'
    }
    delete query.serverUrlVisible
    delete query.disableUploadDir
    Object.assign(this, query)
  }

  toJSON() {
    const obj = {
      decompress: this.decompress,
      force: this.force,
      namespace: this.namespace,
      token: this.token
    }
    if (this.serverUrlVisible) {
      obj.serverUrl = this.serverUrl
    }
    return obj
  }

  @autorun
  auto() {
    const upload = uppy.getPlugin('XHRUpload')
    let url = this.serverUrl.trim()
    const prefix = url.startsWith('/') ? '/' : ''
    url = url.replace(/^\/+/, '')

    Object.assign(upload.opts, {
      endpoint: `${prefix}${join(url, this.namespace)}?${stringify(
        this.query
      )}`
    })
  }

  @autorun
  autoToken() {
    const upload = uppy.getPlugin('XHRUpload')
    Object.assign(upload.opts, {
      headers: Object.assign({}, upload.headers, { authorization: this.token })
    })
  }
}

const uppy = registerUppy({})
const app = App.create(global.__INITIAL__STATE__ || {})
render(h(app), window['form-container'])
