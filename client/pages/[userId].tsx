import React, { useEffect, useState } from "react";
import styled from "styled-components";
import FilterBox from "../Components/Common/FilterBox";
import Image from "next/image";
import useWindowSize from "../Hooks/useWindowDimensions";
import ProfileBox from "../Components/Common/ProfileBox";
import CustomModal from "../Components/Common/CustomModal";
import Tweet from "../Components/Common/Tweet";
import { GetServerSideProps } from "next";
import FollowerInfo from "../Components/Common/FollowerInfo";
import axiosApi from "../app/services/axiosApi";
import { AxiosError } from "axios";
import { useAppDispatch } from "../Hooks/store";
import { logOut } from "../features/auth/authSlice";
import FullScreenLoader from "../Components/Common/FullScreenLoader";
import toast, { Toaster } from "react-hot-toast";
import { ToastMessage } from "../styles/Toast.styles";
import EditProfile from "../Components/Common/EditProfile";
import { TweetButton } from "../Components/Common/CreateTweet";

const Profile = ({
  data,
  isAuthenticated = true,
  isLoading = true,
  token,
}: {
  data: ProfileResponse;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string;
}) => {
  const dispatch = useAppDispatch();
  const [followerModalIsOpen, setFollowerModalIsOpen] = useState(false);
  const [followingModalIsOpen, setFollowingModalIsOpen] = useState(false);
  const [editProfileModalIsOpen, setEditProfileModalIsOpen] = useState(false);
  const { width } = useWindowSize();
  const [message, setMessage] = useState<string>("");
  const [fileList, setFileList] = useState<Array<{ id: string; file: File }>>(
    []
  );

  const requestConfig = {
    headers: {
      authorization: `Bearer ${token}`,
    },
  };

  const createComment = async (formData: FormData) => {
    try {
      const response = await axiosApi.post("/comment", formData, requestConfig);
      console.log(response);
      toast.success(() => (
        <ToastMessage>Created Reply Successfully</ToastMessage>
      ));
    } catch (error) {
      toast.error(() => (
        <ToastMessage>
          Error in creating Reply: <br /> {(error as AxiosError).message}
        </ToastMessage>
      ));
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fileArray = fileList.map((item) => item.file);
    console.log(fileArray);
    console.log(message);
    setFileList([]);
    setMessage("");
    const formData = new FormData();
    formData.append("comment", message);
    //Replace value with tweetId later
    formData.append("tweetId", "62b6feba6c514dd62f3ac6d0");
    for (let i = 0; i < fileList.length; i++) {
      formData.append("media", fileArray[i]);
      console.log(fileArray[i]);
    }
    createComment(formData);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      async () => await axiosApi.get("clearcookie");
      dispatch(logOut());
    }
  }, []);

  useEffect(() => {
    if (followerModalIsOpen || editProfileModalIsOpen || followingModalIsOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [followerModalIsOpen, editProfileModalIsOpen, followingModalIsOpen]);

  const filterList = {
    1: "Tweets",
    2: "Tweets & Replies",
    3: "Media",
    4: "Likes",
  };

  return isLoading ? (
    <FullScreenLoader />
  ) : (
    <>
      {!editProfileModalIsOpen && <Toaster />}
      {data?.data[0].coverPic !== undefined && (
        <Image
          src={data?.data[0].coverPic}
          className="banner-image"
          alt="banner"
          layout="responsive"
          width={100}
          height={width! > 880 ? 15 : 45}
        />
      )}
      <ProfileBox
        setFollowerModalIsOpen={setFollowerModalIsOpen}
        followerModalIsOpen={followerModalIsOpen}
        setEditProfileModalIsOpen={setEditProfileModalIsOpen}
        editProfileModalIsOpen={editProfileModalIsOpen}
        name={data?.data[0].name as string}
        profilePic={data?.data[0].profilePic}
        username={data?.data[0].username as string}
        followers={data?.data[0].followers as number}
        following={data?.data[0].following as number}
        bio={data?.data[0].bio as string}
      />
      <CustomModal
        setModalIsOpen={setFollowerModalIsOpen}
        modalIsOpen={followerModalIsOpen}
        name={data?.data[0].name as string}
        username={data?.data[0].username as string}
        followers={data?.data[0].followers as number}
        following={data?.data[0].following as number}
        modalTitle={`${data?.data[0].name as string} is Following`}
      >
        <FollowerInfo />
      </CustomModal>
      <CustomModal
        setModalIsOpen={setEditProfileModalIsOpen}
        modalIsOpen={editProfileModalIsOpen}
        modalTitle={"Edit Profile"}
        shouldCloseOnOverlayClick={false}
        closeIconOnClick={() =>
          toast(
            (t) => (
              <span>
                <ToastMessage>Discard Changes if any?</ToastMessage>
                <DiscardButton
                  onClick={() => {
                    toast.dismiss(t.id);
                    setEditProfileModalIsOpen(false);
                  }}
                >
                  Discard
                </DiscardButton>
              </span>
            ),
            {
              duration: Infinity,
              position: "top-right",
            }
          )
        }
      >
        <Toaster />
        <EditProfile
          coverPic={data?.data[0].coverPic}
          profilePic={data?.data[0].profilePic}
          name={data?.data[0].name as string}
          username={data?.data[0].username as string}
          bio={data?.data[0].bio as string}
        />
      </CustomModal>
      <ContentContainer>
        <FilterBox filterList={filterList} />
        <Tweet
          message={message}
          setMessage={setMessage}
          fileList={fileList}
          setFileList={setFileList}
          onSubmit={onSubmit}
        />
      </ContentContainer>
    </>
  );
};

export default Profile;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const token = ctx.req.cookies.jwt;
  const userId = ctx.params?.userId;
  try {
    const response = await axiosApi.get(`users/${userId}`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return {
      props: {
        data: response.data,
        isLoading: false,
        token,
      },
    };
  } catch (error) {
    if ((error as AxiosError).response?.status === 401) {
      return {
        props: {
          isAuthenticated: false,
        },
      };
    }
  }
  return {
    props: {},
  };
};

const DiscardButton = styled(TweetButton)`
  background-color: rgba(255, 0, 0, 1);
  margin-top: 1rem;
  border-radius: 8px;
  &:hover {
    background-color: rgba(255, 0, 0, 0.7);
  }
`;

const ContentContainer = styled.div`
  width: min(95%, 102.4rem);
  margin-inline: auto;
  padding-block: 2rem;

  @media screen and (min-width: 40em) {
    display: grid;
    grid-template-columns: 1fr 3fr;
    gap: 2rem;
  }
`;
