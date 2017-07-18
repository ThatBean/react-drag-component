import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import { muteEvent } from 'source/__lib__'

import LocalClassName from './text-editable.pcss'
const CSS_TEXT_EDITABLE_DISPLAY = LocalClassName[ 'text-editable-display' ]
const CSS_TEXT_EDITABLE_EDIT = LocalClassName[ 'text-editable-edit' ]

/**
 * double click to edit, will auto trim newValue
 * will use state.editingValue when editing
 * will use props.value when not editing
 * on Multi-Line mode, use Shift-Enter to enter '\n'
 **/
class TextEditable extends PureComponent {
  static propTypes = {
    value: PropTypes.string.isRequired, // function(newValue), receives edit finish callback
    onChange: PropTypes.func.isRequired, // function(), return current value
    onEditStateChange: PropTypes.func, // will receive { isEditing: Boolean }
    placeholder: PropTypes.string,
    isDisabled: PropTypes.bool,
    isMultiLine: PropTypes.bool,
    editOnMount: PropTypes.bool, // only useful on new component
    className: PropTypes.string
  }

  constructor (props) {
    super(props)

    this.startEdit = muteEvent(() => this.toggleEditing(true))
    this.endEdit = () => this.toggleEditing(false)

    this.onEditUpdate = (event) => this.setState({ editingValue: event.target.value })
    this.onEditKeyPress = (event) => checkEnterKey(event) && (!this.props.isMultiLine || !event.shiftKey) && this.onEditFinish()
    this.onEditFinish = () => {
      const resultValue = this.state.editingValue.trim()
      if (resultValue !== this.props.value) this.props.onChange(resultValue)
      this.endEdit()
    }

    this.editOnMount = props.editOnMount

    this.setElementRef = (ref) => (this.textareaElement = ref)
    this.textareaElement = null

    this.state = { isEditing: false, editingValue: '' }
  }

  toggleEditing (isEditing) {
    if (__DEV__ && typeof (isEditing) !== 'boolean') throw new Error(`[TextEditable] error isEditing type ${typeof (isEditing)}`)
    if (isEditing === this.state.isEditing) return
    this.setState({ isEditing, editingValue: this.props.value })
    isEditing && setTimeout(() => {
      if (!this.textareaElement) return
      const { value, scrollHeight, offsetHeight } = this.textareaElement
      this.textareaElement.focus()
      this.textareaElement.setSelectionRange(0, value.length) // select all
      this.textareaElement.scrollTop = scrollHeight - offsetHeight // scroll down
    }, 0)
  }

  componentDidMount () { this.editOnMount && this.startEdit() }

  componentWillReceiveProps (nextProps, nextState) { nextProps.isDisabled && nextState.isEditing && this.setState({ isEditing: false }) }

  componentDidUpdate (prevProps, prevState) {
    const { onEditStateChange } = this.props
    const { isEditing } = this.state
    isEditing !== prevState.isEditing && onEditStateChange && onEditStateChange({ isEditing })
  }

  render () {
    const { value, placeholder, isDisabled, className } = this.props
    const { isEditing, editingValue } = this.state
    return (isDisabled || !isEditing)
      ? <div
        className={`${CSS_TEXT_EDITABLE_DISPLAY} ${className || ''}`}
        onDoubleClick={isDisabled ? null : this.startEdit}
      >
        {value || placeholder}
      </div>
      : <textarea
        ref={this.setElementRef}
        className={`${CSS_TEXT_EDITABLE_EDIT} ${className || ''}`}
        value={editingValue}
        placeholder={placeholder || ''}
        onChange={this.onEditUpdate}
        onKeyDown={this.onEditKeyPress}
        onBlur={this.onEditFinish}
      />
  }
}

const checkEnterKey = (event) => (event.code === 'Enter' || event.keyCode === 13 || event.which === 13)

export {
  TextEditable
}
