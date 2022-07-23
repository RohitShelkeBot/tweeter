import Modal from "react-modal";
import styled from "styled-components";
import { GrClose } from "react-icons/gr";

Modal.setAppElement("#__next");

const CustomModal = ({
  setModalIsOpen,
  modalIsOpen,
  children,
  ...props
}: ModalProps) => {
  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={() => setModalIsOpen(false)}
      contentLabel="Followers & Following Modal"
      shouldCloseOnOverlayClick={props.shouldCloseOnOverlayClick ? true : false}
      style={{
        overlay: {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          zIndex: 2,
        },
        content: {
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(95% , 60rem)",
          border: "1px solid #ccc",
          background: "#fff",
          overflow: "auto",
          WebkitOverflowScrolling: "touch",
          borderRadius: "8px",
          outline: "none",
          maxHeight: "80vh",
          height: "650px",
          padding: "2rem",
        },
      }}
    >
      <MainWrapper>
        <CloseIconDivWrapper>
          <span>{props.modalTitle}</span>
          <CloseIcon
            onClick={
              props.closeIconOnClick
                ? props.closeIconOnClick
                : () => setModalIsOpen(false)
            }
          />
        </CloseIconDivWrapper>
        <hr />
        {children}
      </MainWrapper>
    </Modal>
  );
};
export default CustomModal;

const MainWrapper = styled.div`
  font: 600 1.4rem var(--ff-poppins);

  hr {
    border-color: hsla(0, 0%, 88%, 1);
    border-width: 1px;
  }
`;

const CloseIcon = styled(GrClose)`
  cursor: pointer;
  font-size: 1.4rem;
`;

const CloseIconDivWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;
