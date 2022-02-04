/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type {CommandListenerEditorPriority} from 'lexical';

import * as React from 'react';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {useCollaborationContext} from '@lexical/react/LexicalCollaborationPlugin';
import {useCallback, useEffect, useState} from 'react';
import {$createStickyNode} from '../nodes/StickyNode';
import {$log, $getRoot} from 'lexical';
import {SUPPORT_SPEECH_RECOGNITION} from './SpeechToTextPlugin';
import {importFile, exportFile} from '@lexical/helpers/file';

const EditorPriority: CommandListenerEditorPriority = 0;

export default function ActionsPlugins({
  isRichText,
}: {
  isRichText: boolean,
}): React$Node {
  const [isReadOnly, setIsReadyOnly] = useState(false);
  const [isSpeechToText, setIsSpeechToText] = useState(false);
  const [connected, setConnected] = useState(false);
  const [editor] = useLexicalComposerContext();
  const {yjsDocMap} = useCollaborationContext();
  const isCollab = yjsDocMap.get('main') !== undefined;

  useEffect(() => {
    return editor.addListener(
      'command',
      (type, payload) => {
        if (type === 'readOnly') {
          const readOnly = payload;
          setIsReadyOnly(readOnly);
        } else if (type === 'connected') {
          const isConnected = payload;
          setConnected(isConnected);
        }
        return false;
      },
      EditorPriority,
    );
  }, [editor]);

  const insertSticky = useCallback(() => {
    editor.update(() => {
      $log('insertSticky');
      const root = $getRoot();
      const stickyNode = $createStickyNode(0, 0);
      root.append(stickyNode);
    });
  }, [editor]);

  return (
    <div className="actions">
      {SUPPORT_SPEECH_RECOGNITION && (
        <button
          onClick={() => {
            editor.execCommand('speechToText', !isSpeechToText);
            setIsSpeechToText(!isSpeechToText);
          }}
          className={
            'action-button action-button-mic ' +
            (isSpeechToText ? 'active' : '')
          }>
          <i className="mic" />
        </button>
      )}
      <button
        className="action-button import"
        onClick={() => importFile(editor)}>
        <i className="import" />
      </button>
      <button
        className="action-button export"
        onClick={() =>
          exportFile(editor, {
            fileName: `Playground ${new Date().toISOString()}`,
            source: 'Playground',
          })
        }>
        <i className="export" />
      </button>
      <button className="action-button sticky" onClick={insertSticky}>
        <i className="sticky" />
      </button>
      <button
        className="action-button clear"
        onClick={() => {
          editor.execCommand('clearEditor');
          editor.focus();
        }}>
        <i className="clear" />
      </button>
      <button
        className="action-button lock"
        onClick={() => {
          editor.execCommand('readOnly', !isReadOnly);
        }}>
        <i className={isReadOnly ? 'unlock' : 'lock'} />
      </button>
      {isCollab && (
        <button
          className="action-button connect"
          onClick={() => {
            editor.execCommand('toggleConnect', !connected);
          }}>
          <i className={connected ? 'disconnect' : 'connect'} />
        </button>
      )}
    </div>
  );
}