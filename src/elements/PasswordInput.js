import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import Input from '../elements/Input';

const PasswordInput = (props, ref) => {
  const inputRef = useRef();
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    }
  }));

  const [ showPassword, setShowPassword ] = useState(false);
  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <Input
      {...props}
      ref={inputRef}
      showPassword={showPassword}
      toggleShowPassword={toggleShowPassword}
      type={showPassword ? "text" : "password"}
      value={props.password}
      onChange={e => props.setPassword(e.target.value)}
      onKeyDown={e => {
        if (!showPassword && e.getModifierState('CapsLock')) {
          props.setErrorMessage('CAPSLOCK is enabled!');
        } else {
          props.setErrorMessage('');
        }
      }}
    />
  );
};

export default forwardRef(PasswordInput);
