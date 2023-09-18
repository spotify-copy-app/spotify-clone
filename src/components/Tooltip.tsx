import { useState, ReactNode } from 'react';
import Tippy from '@tippyjs/react/headless';
import { Instance, Props, Placement } from 'tippy.js';
import 'tippy.js/dist/tippy.css';

type BadgeProps = {
  text?: string;
  placement?: Placement;
  children: ReactNode;
};

const Tooltip = ({ text, placement, children }: BadgeProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const onMount = () => {
    setIsVisible(true);
  };

  const onHide = (instance: Instance<Props>) => {
    requestAnimationFrame(instance.unmount);
    setIsVisible(false);
  };

  return (
    <Tippy
      disabled={!text}
      placement={placement}
      offset={[0, 8]}
      animation
      render={(attrs) => (
        <div
          className="duration-200 tippy-box"
          data-state={isVisible ? 'visible' : 'hidden'}
          data-animation="fade"
          tabIndex={-1}
          {...attrs}
        >
          <div className="tippy-content tooltip">{text}</div>
        </div>
      )}
      delay={[300, 0]}
      onMount={onMount}
      onHide={onHide}
    >
      <div>{children}</div>
    </Tippy>
  );
};

export default Tooltip;