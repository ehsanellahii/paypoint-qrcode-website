import React from 'react';
import DialogWrapper from '~/components/DialogWrapper';

const RegisterDialog = ({ isOpen, handleOpenChange }: { isOpen: boolean; handleOpenChange: (open: boolean) => void }) => {
  return (
    <DialogWrapper isOpen={isOpen} handleOpenChange={handleOpenChange} title='Register'>
      Register Content
    </DialogWrapper>
  );
};

export default RegisterDialog;
