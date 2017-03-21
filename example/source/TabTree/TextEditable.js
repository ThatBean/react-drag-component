import React, { Component, PropTypes } from 'react'

import LocalClassName from './text-editable.pcss'
const CSS_TEXT_EDITABLE = LocalClassName[ 'text-editable' ]

function muteEvent (event) {
  event && event.preventDefault()
  event && event.stopPropagation()
}

function checkEnterKey (event) {
  return (event.code === 'Enter' || event.keyCode === 13 || event.which === 13)
}

/**
 * double click to edit, will auto trim newValue
 * will use state.editingValue when editing
 * will use props.getValue() when not editing
 * on Multi-Line mode, use Shift-Enter to enter '\n'
 **/
class TextEditable extends Component {
  static propTypes = {
    setValue: PropTypes.func.isRequired, // function(newValue), receives edit finish callback
    getValue: PropTypes.func.isRequired, // function(), return current value
    placeholder: PropTypes.string,
    isDisabled: PropTypes.bool,
    isMultiLine: PropTypes.bool,
    editOnMount: PropTypes.bool,
    className: PropTypes.string
  }

  constructor (props) {
    super(props)

    this.getEditValue = () => (this.props.getValue() || '')
    this.startEdit = (event) => {
      muteEvent(event)
      this.toggleEditing(true)
    }
    this.endEdit = () => this.toggleEditing(false)

    this.onEditUpdate = (event) => this.setState({ editingValue: event.target.value })
    this.onEditKeyPress = (event) => checkEnterKey(event) && (!this.props.isMultiLine || !event.shiftKey) && this.onEditFinish()
    this.onEditFinish = () => {
      const resultValue = this.state.editingValue.trim()
      if (resultValue !== this.getEditValue()) this.props.setValue(resultValue)
      this.endEdit()
    }

    this.setElementRef = (ref) => (this.textElement = ref)
    this.textElement = null

    this.state = {
      isEditing: false,
      editingValue: ''
    }
  }

  componentDidMount () {
    if (this.props.editOnMount) this.startEdit()
  }

  toggleEditing (isEditing) {
    isEditing = Boolean(isEditing)
    if (isEditing === this.state.isEditing) return
    this.setState({ isEditing, editingValue: this.props.getValue() })
    isEditing && setTimeout(() => {
      if (!this.textElement) return
      this.textElement.focus()
      // move cursor to the end of contents
      const { value, scrollHeight, offsetHeight } = this.textElement
      this.textElement.setSelectionRange(value.length, value.length)
      this.textElement.scrollTop = scrollHeight - offsetHeight
    }, 0)
  }

  render () {
    const { placeholder, isDisabled, className } = this.props
    const { isEditing, editingValue } = this.state
    if (isDisabled || !isEditing) {
      return <div
        ref={this.setElementRef}
        className={`${CSS_TEXT_EDITABLE} ${className || ''}`}
        onDoubleClick={isDisabled ? null : this.startEdit}
      >
        {this.getEditValue()}
      </div>
    } else {
      return <textarea
        ref={this.setElementRef}
        className={`${CSS_TEXT_EDITABLE} ${className || ''}`}
        value={editingValue}
        placeholder={placeholder || ''}
        onChange={this.onEditUpdate}
        onKeyDown={this.onEditKeyPress}
        onBlur={this.onEditFinish}
      />
    }
  }
}

export {
  TextEditable
}
