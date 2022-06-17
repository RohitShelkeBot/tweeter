import Image from "next/image";
import styled from "styled-components";

const ProfileInfo = (props: ProfileInfoProps) => {
  return (
    <ProfileInfoWrapper>
      <ProfilePic
        src="https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/170.jpg"
        width={42}
        height={37}
      />
      <div>
        <span>Austin Neil</span>
        <span>12k Followers</span>
      </div>
    </ProfileInfoWrapper>
  );
};
export default ProfileInfo;

const ProfilePic = styled(Image)`
  border-radius: 6px;
`;

const ProfileInfoWrapper = styled.div`
  display: flex;
  gap: 2rem;
  span {
    display: block;
  }
  span:first-child {
    font:500 1.6rem var(--ff-poppins) 
  }
  span + span {
    font: 500 1.4rem var(--ff-poppins);
    color: hsla(0, 0%, 51%, 1);
    font-size: 1.2rem;
  }
`;
