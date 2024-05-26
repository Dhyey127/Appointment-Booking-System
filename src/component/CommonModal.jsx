import { Modal } from "antd";
import React from "react";

export default function CommonModal({
  isModalOpen,
  title,
  content,
  handleCancel,
}) {
  return (
    <Modal
      title={title}
      open={isModalOpen}
      footer={null}
      onCancel={handleCancel}
    >
      {content}
    </Modal>
  );
}
