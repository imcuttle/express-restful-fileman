/**
 * @author Cuttle Cong
 * @date 2018/8/24
 * @description
 */

import Uppy from '@uppy/core'
import Dashboard from '@uppy/dashboard'
import DragDrop from '@uppy/drag-drop'
import ProgressBar from '@uppy/progress-bar'
import XhrUpload from '@uppy/xhr-upload'
import Webcam from '@uppy/webcam'
import Url from '@uppy/url'

import DirUploader from './DirUploader'

export default function register({ endpoint, ...options } = {}) {
  require('uppy/dist/uppy.css')
  const uppy = Uppy(options)

  return uppy
    .use(Dashboard, {
      target: '#uppy',
      inline: true,
      replaceTargetContent: true,
      showProgressDetails: true
      // metaFields: [{ id: 'name', name: 'name', placeholder: 'file name' }]
    })
    .use(DragDrop, {
      target: Dashboard
    })
    .use(ProgressBar, {
      target: Dashboard,
      fixed: true,
      hideAfterFinish: false
    })
    .use(XhrUpload, {
      bundle: true,
      formData: true,
      getResponseError(responseText, xhr) {
        return new Error(JSON.parse(responseText).message)
      },
      getResponseData(responseText, response) {
        let json = JSON.parse(responseText)
        if (json.code === 200) {
          json.data.forEach(link => {})
        }
      },
      fieldName: 'files[]'
    })
    .use(Url, {
      target: Dashboard,
      serverUrl: 'https://companion.uppy.io/'
    })
    .use(DirUploader, {
      target: Dashboard
    })
    .use(Webcam, {
      target: Dashboard
    })
    .on('complete', result => {
      console.log('Upload result:', result)
    })
}
