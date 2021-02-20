import React from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

export default function BlinkingValue ({value}) {  
  return (
    <TransitionGroup className="transitiongroup" style={{ display:'inline' }}>
      <CSSTransition className="csstransition"
        key={value}
        timeout={2000}
        classNames="messageout"
      >
        <span>
          {value}
        </span>
      </CSSTransition>
    </TransitionGroup>
  );
}