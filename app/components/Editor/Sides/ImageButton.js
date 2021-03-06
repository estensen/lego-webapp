// @flow

import React, { Component } from 'react';
import { Block, addNewBlock } from 'medium-draft';
import ImageUpload from 'app/components/Upload/ImageUpload';
import type { DropFile } from 'app/components/Upload';

type Props = {
  setEditorState: any => void,
  getEditorState: () => any,
  close: () => void
};

type State = {
  showUpload: boolean
};

export default class ImageButton extends Component<Props, State> {
  input: ?HTMLInputElement;

  state = {
    showUpload: false
  };

  onClick = () => {
    this.setState({ showUpload: true });
  };

  onSubmit = (image: File | Array<DropFile>) => {
    const { close, setEditorState, getEditorState } = this.props;

    setEditorState(
      addNewBlock(getEditorState(), Block.IMAGE, {
        image
      })
    );

    close();
  };

  render() {
    return (
      <button
        className="md-sb-button md-sb-img-button"
        type="button"
        onClick={this.onClick}
        title="Add an Image"
      >
        <i className="fa fa-image" />
        {this.state.showUpload && (
          <ImageUpload
            onClose={this.props.close}
            onSubmit={this.onSubmit}
            inModal
            crop
          />
        )}
      </button>
    );
  }
}
