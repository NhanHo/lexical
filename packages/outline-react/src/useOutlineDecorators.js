/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 */

import type {OutlineEditor} from 'outline';

// $FlowFixMe: Flow doesn't like this for some reason
import {createPortal, flushSync} from 'react-dom';

import * as React from 'react';
import {useEffect, useMemo, useState} from 'react';

export default function useOutlineDecorators(
  editor: OutlineEditor,
): Array<React.Node> {
  const [decorators, setDecorators] = useState<{[string]: React.Node}>(() =>
    editor.getDecorators(),
  );
  // Subscribe to changes
  useEffect(() => {
    return editor.addDecoratorListener((nextDecorators) => {
      flushSync(() => {
        setDecorators(nextDecorators);
      });
    });
  }, [editor]);
  // Return decorators defined as React Portals
  return useMemo(() => {
    const decoratedPortals = [];
    const decoratorKeys = Object.keys(decorators);
    for (let i = 0; i < decoratorKeys.length; i++) {
      const nodeKey = decoratorKeys[i];
      const reactDecorator = decorators[nodeKey];
      const element = editor.getElementByKey(nodeKey);
      if (element !== null) {
        decoratedPortals.push(createPortal(reactDecorator, element));
      }
    }
    return decoratedPortals;
  }, [decorators, editor]);
}