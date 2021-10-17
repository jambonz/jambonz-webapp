import styled from 'styled-components/macro';
import React, { useState, useRef, useEffect, useCallback } from 'react';

import Link from './Link';

const Tooltip = styled.span`
  display: none;

  label > span:hover > & {
    display: inline;
    position: absolute;
    bottom: 100%;
    right: calc(50% - 1rem);
    transform: translateX(50%);
    padding: 0.75rem 1rem;
    border-radius: 0.25rem;
    background: #FFF;
    box-shadow: 0 0.375rem 0.25rem rgba(0, 0, 0, 0.12),
                0 0        0.25rem rgba(0, 0, 0, 0.18);
    z-index: 80;
    white-space: nowrap;
  }
`;

const StyledLinkWithTooltip = styled.span`
  position: relative;

  > span {
    font-size: 14px;
    position: absolute;
    left: 50%;
    transform: translate3d(-50%, calc(-100% - 5px), 0);
    padding: 0.75rem 1rem;
    border-radius: 0.25rem;
    border: 1px solid #C6C6C6;
    background: #FFF;
    z-index: 80;
    white-space: pre;

    &:after {
      content: "";
      width: 0; 
      height: 0; 
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 8px solid #FFF;
      position: absolute;
      left: 50%;
      top: 100%;
      transform: translateX(-50%);
      z-index: 2;
    }

    &:before {
      content: "";
      width: 0; 
      height: 0; 
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-top: 10px solid #C6C6C6;
      position: absolute;
      left: 50%;
      top: 100%;
      transform: translateX(-50%);
      z-index: 1;
    }
  }
`;

const LinkWithTooltip = props => {
  const [isActive, setIsActive] = useState(false);
  const tooltipRef = useRef();
  const triggerRef = useRef();

  const handleLinkClick = useCallback(() => {
    setIsActive((oldActive) => {
      const newActive = !oldActive;
      return newActive;
    });
  }, [setIsActive]);

  const handleOuterClick = useCallback((e) => {
    if (!tooltipRef.current) {
      return;
    }

    if (tooltipRef.current.contains(e.target)) {
      return;
    }

    if (triggerRef.current.contains(e.target)) {
      return;
    }

    handleLinkClick();
  }, [tooltipRef, triggerRef, handleLinkClick]);

  useEffect(() => {
    document.addEventListener('click', handleOuterClick, false);

    return () => document.removeEventListener('click', handleOuterClick, false);
  }, [handleOuterClick]);

  return (
    <StyledLinkWithTooltip>
      <Link to="#" onClick={handleLinkClick}>
        <span ref={triggerRef}>{props.children}</span>
      </Link>
      {isActive ? (
        <span ref={tooltipRef}>
          {props.tipText}
        </span>
      ) : null}
    </StyledLinkWithTooltip>
  );
};

export {
  LinkWithTooltip,
};

export default Tooltip;
