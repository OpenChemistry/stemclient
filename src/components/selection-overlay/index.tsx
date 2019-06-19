import React, { useEffect, useRef, useState } from 'react';
import { ImageDataSource } from '../../stem-image/data';
import { BaseSelection } from '../../stem-image/selection';
import { Vec2 } from '../../stem-image/types';

interface Props {
  source: ImageDataSource;
  selection: Vec2[];
  selectionClass: new (parent: HTMLDivElement, source: ImageDataSource) => BaseSelection;
  onChange?: (selection: Vec2[]) => void;
}

const SelectionOverlay : React.FC<Props> = ({source, selection, selectionClass, onChange}) => {

  const containerRef = useRef(null);
  const [imageSelection, setImageSelection] = useState(null as BaseSelection | null);

  const selectionObserver = (handlePositions: Vec2[]) => {
    if (onChange) {
      onChange(handlePositions);
    }
  }

  const updateSelection = () => {
    if (imageSelection) {
      imageSelection!.setHandles(selection);
    }
  }

  useEffect(() => {
    setImageSelection(new selectionClass(containerRef.current!, source));
  }, [source, setImageSelection]);

  useEffect(() => {
    if (imageSelection) {
      imageSelection.subscribe('selectionChanged', selectionObserver);
      updateSelection();
    }
    return () => {
      if (imageSelection) {
        imageSelection.removeSubscriptions();
        imageSelection.unsubscribe('selectionChanged', selectionObserver);
      }
    }
  }, [imageSelection]);

  useEffect(() => {
    updateSelection();
  }, [selection]);

  return <div style={{width: '100%', height: '100%'}} ref={containerRef}></div>;
}

export default SelectionOverlay;
