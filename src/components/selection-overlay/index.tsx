import React, { useEffect, useRef, useState } from 'react';
import { ImageDataSource } from '../../stem-image/data';
import { SquareSelection } from '../../stem-image/selection';
import { Vec2, Vec4 } from '../../stem-image/types';

interface Props {
  source: ImageDataSource;
  selection: [number, number, number, number];
  onSelectionChange?: (selection: Vec4) => void;
}

const SelectionOverlay : React.FC<Props> = ({source, selection, onSelectionChange}) => {

  const containerRef = useRef(null);
  const [imageSelection, setImageSelection] = useState(null as SquareSelection | null);

  const selectionObserver = ({p0, p1} : {p0: Vec2, p1: Vec2}) => {
    const newSelection : Vec4 = [
      Math.min(p0[0], p1[0]), Math.max(p0[0], p1[0]),
      Math.min(p0[1], p1[1]), Math.max(p0[1], p1[1])
    ];
    if (onSelectionChange) {
      onSelectionChange(newSelection);
    }
  }

  const updateSelection = () => {
    if (imageSelection) {
      imageSelection!.setSelection([selection[0], selection[2]], [selection[1], selection[3]]);
    }
  }

  useEffect(() => {
    setImageSelection(new SquareSelection(containerRef.current!, source));
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

  return <div style={{width: '100%'}} ref={containerRef}></div>;
}

export default SelectionOverlay;
