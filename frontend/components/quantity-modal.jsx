import React, { useState } from 'react';
import Modal from 'react-modal';
import { Button } from 'handy-components';

export default function QuantityModal(props) {
  const { isOpen, onClose, clickOK, item } = props;
  const [qty, setQty] = useState(1);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onAfterOpen={ () => { setQty(1); } }
        onRequestClose={ onClose }
        contentLabel="Modal"
        style={{
          overlay: {
            background: 'rgba(0, 0, 0, 0.50)',
          },
          content: {
            background: '#F5F6F7',
            padding: 0,
            margin: 'auto',
            width: 300,
            height: 238,
          }
        }}
      >
        <div className="content">
          <h1>Enter Quantity</h1>
          <h2>{ item?.label }</h2>
          <form>
            <input onChange={ e => setQty(e.target.value) } value={ qty } /><br />
            <Button
              submit
              text="OK"
              onClick={ () => clickOK(qty) }
            />
          </form>
        </div>
      </Modal>
      <style jsx>{`
        .content {
          padding: 30px;
          text-align: center;
        }
        h1 {
          font-size: 16px;
          margin-bottom: 14px;
        }
        h2 {
          font-size: 12px;
          margin-bottom: 20px;
        }
        input {
          width: 170px;
          padding: 13px;
          margin-bottom: 20px;
        }
      `}</style>
    </>
  );
}
