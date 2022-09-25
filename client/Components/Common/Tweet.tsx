import Image from "next/image";
import { AiOutlineDelete, AiOutlineRetweet } from "react-icons/ai";
import styled from "styled-components";
import ProfileInfo from "./ProfileInfo";
import TweetOptions from "./TweetOptions";
import CreateTweet, { TweetImageArrayWrapper } from "./CreateTweet";
import { MouseEvent, useState } from "react";
import {
  CancelButton,
  DiscardButton,
  SubToastMessage,
  ToastMessage,
} from "../../styles/Toast.styles";
import toast from "react-hot-toast";
import {
  useCreateTweetMutation,
  useDeleteTweetMutation,
  useGetFollowingReplyQuery,
} from "../../app/services/api";
import { useAppSelector } from "../../Hooks/store";
import CustomModal from "./CustomModal";
import { useRouter } from "next/router";
import Link from "next/link";
import { LoaderWrapper } from "../../pages/tweet/[tweetId]";
import { Loader } from "./FullScreenLoader";

const Tweet = ({ TweetReplyData, ...props }: TweetProps) => {
  const [message, setMessage] = useState<string>("");
  const [fileList, setFileList] = useState<Array<{ id: string; file: File }>>(
    []
  );
  const [isCommentButtonClicked, setIsCommentButtonClicked] = useState(false);
  const [createTweet] = useCreateTweetMutation();
  const [deleteTweet] = useDeleteTweetMutation();
  const tweetCreationDate = new Date(props.tweetCreationDate);
  const [isLiked, setIsLiked] = useState(props.isLiked);
  const [isSaved, setIsSaved] = useState(props.isSaved);
  const [isRetweeted, setIsRetweeted] = useState(props.isRetweeted);
  const currentUserPfp = useAppSelector((state) => state.auth.user?.profilePic);
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const currentUsername = useAppSelector((state) => state.auth.user?.name);
  const [isModalOpen, setIsModalOpen] = useState(false); // Maybe lift up to stop scroll
  const { push } = useRouter();
  const { data: FollowingReplyTweetData } = useGetFollowingReplyQuery(
    { tweetId: props.tweetId, userId: props.authorId },
    { skip: !props.fetchReply } //Conditionally fetch reply only when reply exists
  );
  const [isLoading, setIsLoading] = useState(true);

  const followingReplyTweet = FollowingReplyTweetData?.data[0];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isHashtagPresent = /#[a-z]+/gi;
    const fileArray = fileList.map((item) => item.file);
    setFileList([]);
    setMessage("");
    const formData = new FormData();
    formData.append("tweetId", props.tweetId);
    formData.append("shared", "true");
    formData.append("tweet", message);
    for (let i = 0; i < fileList.length; i++) {
      formData.append("media", fileArray[i]);
    }
    if (isHashtagPresent.test(message)) {
      const hashtagArray = message.match(isHashtagPresent);
      if (hashtagArray !== null) {
        for (let i = 0; i < hashtagArray.length; i++) {
          formData.append("hashtags", hashtagArray[i]);
        }
      }
    }
    try {
      await createTweet(formData).unwrap();
      toast.success(() => (
        <ToastMessage>Created Tweet Successfully</ToastMessage>
      ));
      setIsModalOpen(false);
    } catch (error) {
      toast.error(() => <ToastMessage>Error in creating Tweet</ToastMessage>);
    }
  };

  const onDeleteButtonClick = (
    tweetId: string,
    e: MouseEvent<HTMLDivElement>
  ) => {
    e.stopPropagation();
    toast.dismiss();
    toast(
      (t) => (
        <span>
          <ToastMessage>Delete Tweet?</ToastMessage>
          <SubToastMessage>
            This cannot be undone and it will be removed from your profile, the
            timeline of any accounts that follow you.
          </SubToastMessage>
          <DiscardButton
            onClick={async () => {
              try {
                await deleteTweet(tweetId).unwrap();
                toast.success(() => (
                  <ToastMessage>Deleted Tweet Successfully</ToastMessage>
                ));
              } catch (error) {
                toast.error(() => (
                  <ToastMessage>Error in Deleting Tweet</ToastMessage>
                ));
              }
              toast.dismiss(t.id);
            }}
          >
            Delete
          </DiscardButton>
          <CancelButton
            onClick={() => {
              toast.dismiss(t.id);
            }}
          >
            Cancel
          </CancelButton>
        </span>
      ),
      {
        duration: Infinity,
        position: "top-center",
      }
    );
  };

  return (
    <>
      {/* <CustomModal
        setModalIsOpen={setIsModalOpen}
        modalIsOpen={isModalOpen}
        modalHeight="fit-content"
        modalTitle={`Reply to ${props.authorUserName}'s Tweet`}
        shouldCloseOnOverlayClick={true}
      >
        <Tweet
          authorId={props.authorId}
          authorName={props.authorName}
          authorUserName={props.authorUserName}
          authorFollowers={props.authorFollowers}
          authorProfilePic={props.authorProfilePic}
          authorTweet={props.authorTweet}
          mediaList={props.mediaList}
          tweetId={props.tweetId}
          tweetCreationDate={props.tweetCreationDate}
          variant="inTweet"
          commentCount={0}
          isSaved={false}
          isLiked={false}
          isRetweeted={false}
          likes={0}
          retweetedUsers={0}
          savedBy={0}
          fetchReply={false} // Don't fetch reply for reply modal
          
        />
        <CreateTweet
          isReplyImageVisible={true}
          placeholder="Tweet your Reply"
          btnText="Reply"
          message={message}
          setMessage={setMessage}
          fileList={fileList}
          setFileList={setFileList}
          onSubmit={onSubmit}
          replyImageUrl={currentUserPfp}
          variant="inTweet"
          focusOnClick={true}
        />
      </CustomModal> */}
      <TweetWrapper>
        {props.isRetweeted && props.variant !== "tweetReply" && (
          <RetweetWrapper>
            <AiOutlineRetweet size={14} />{" "}
            <span>{currentUsername} Retweeted</span>
          </RetweetWrapper>
        )}
        <TweetBox
          variant={props.variant}
          onClick={(e) => {
            e.stopPropagation();
            if (props.variant !== "inTweet") {
              push(`/tweet/${props.tweetId}`);
            }
          }}
        >
          <ProfileInfoContainer>
            <ProfileInfoWrapper
              variant={props.variant}
              onClick={(e) => {
                e.stopPropagation();
                if (props.variant !== "inTweet") {
                  push(`/profile/${props.authorId}`);
                }
              }}
            >
              <ProfileInfo
                name={props.authorName}
                username={props.authorUserName}
                tweetCreationDate={tweetCreationDate.toDateString()}
                followerCount={props.authorFollowers}
                profilePic={props.authorProfilePic}
              />
            </ProfileInfoWrapper>
            {currentUserId === props.authorId && props.variant !== "inTweet" && (
              <DeleteIconWrapper
                onClick={(e) => onDeleteButtonClick(props.tweetId, e)}
              >
                <DeleteIcon size={24} />
              </DeleteIconWrapper>
            )}
          </ProfileInfoContainer>
          <TweetText>{props.authorTweet}</TweetText>
          {props.variant !== "inTweet" ? (
            <ImagesWrapper numOfImages={props.mediaList.length}>
              {props.mediaList.map((mediaItemUrl, index) => (
                <ImageWrapper
                  key={`${mediaItemUrl}${index}`}
                  onClick={(e) => e.stopPropagation()}
                  variant={props.variant}
                >
                  <Link href={mediaItemUrl} passHref>
                    <a target="_blank" rel="noopener noreferrer">
                      <BlurImage
                        key={`${mediaItemUrl} ${index}`}
                        src={mediaItemUrl}
                        alt="Tweet Image"
                        layout="fill"
                        objectFit="cover"
                        isLoading={isLoading}
                        onLoadingComplete={() => setIsLoading(false)}
                      />
                    </a>
                  </Link>
                </ImageWrapper>
              ))}
            </ImagesWrapper>
          ) : (
            props.mediaList.map((mediaItemUrl, index) => (
              <LinkText key={`${mediaItemUrl}${index}`}>
                {mediaItemUrl}
              </LinkText>
            ))
          )}
          {props.variant !== "inTweet" && (
            <TweetInfo>
              <span>{props.commentCount || 0} Comments</span>
              <span>{props.retweetedUsers || 0} Retweets</span>
              <span>{props.likes || 0} Likes</span>
              <span>{props.savedBy || 0} Saved</span>
            </TweetInfo>
          )}
          {props.variant !== "inTweet" && (
            <TweetOptions
              setIsModalOpen={setIsModalOpen}
              setIsCommentButtonClicked={setIsCommentButtonClicked}
              tweetId={props.tweetId}
              isLiked={isLiked}
              isSaved={isSaved}
              isRetweeted={isRetweeted}
              setIsLiked={setIsLiked}
              setIsSaved={setIsSaved}
              setIsRetweeted={setIsRetweeted}
            />
          )}
          {props.fetchReply && followingReplyTweet ? (
            <>
              <ReplyUsername>
                {followingReplyTweet.creator[0].username} Replied
              </ReplyUsername>
              <Tweet
                authorId={followingReplyTweet.creator[0]._id}
                authorName={followingReplyTweet.creator[0].name}
                authorUserName={followingReplyTweet.creator[0].username}
                authorFollowers={0}
                authorProfilePic={followingReplyTweet.creator[0].profilePic}
                authorTweet={followingReplyTweet.tweet}
                mediaList={followingReplyTweet.media}
                tweetId={followingReplyTweet._id}
                commentCount={followingReplyTweet.commentCount[0]}
                tweetCreationDate={followingReplyTweet.createdAt}
                isSaved={followingReplyTweet.saved.length === 0 ? false : true}
                isLiked={
                  followingReplyTweet.liked !== undefined &&
                  followingReplyTweet.liked.length === 0
                    ? false
                    : true
                }
                isRetweeted={
                  followingReplyTweet.retweeted.length === 0 ? false : true
                }
                likes={followingReplyTweet.likes}
                retweetedUsers={followingReplyTweet.retweetedUsers}
                savedBy={followingReplyTweet.savedBy}
                variant="tweetReply"
                fetchReply={false} //Dont fetch reply for another reply
              />
            </>
          ) : (
            props.fetchReply && (
              <LoaderWrapper>
                <Loader size={24} color="var(--clr-primary)" />
              </LoaderWrapper>
            )
          )}
        </TweetBox>
      </TweetWrapper>
    </>
  );
};
export default Tweet;

export const BlurImage = styled(Image)<{ isLoading: boolean }>`
  border-radius: 16px;
  filter: ${({ isLoading }) =>
    isLoading ? "grayscale(100%) blur(40px)" : "grayscale(0) blur(0)"};
  -ms-filter: ${({ isLoading }) =>
    isLoading ? "grayscale(100%) blur(40px)" : "grayscale(0) blur(0)"};
  -webkit-filter: ${({ isLoading }) =>
    isLoading ? "grayscale(100%) blur(40px)" : "grayscale(0) blur(0)"};
  transform: ${({ isLoading }) => (isLoading ? "scale(1.1)" : "scale(1)")};
  transition: all 0.7s ease-in-out;
`;

const ReplyUsername = styled.span`
  display: block;
  margin-block: 4rem 3rem;
  font: 600 1.4rem var(--ff-montserrat);
`;

const LinkText = styled.p`
  font-weight: 500;
  color: hsla(0, 0%, 31%, 1);
  font-family: var(--ff-noto);
`;

const ImageWrapper = styled.div<{
  variant?: "inTweet" | "tweetPage" | "tweetReply";
}>`
  position: relative;
  overflow: hidden; //During blur filter transition
  width: min(45rem, 100%);
  border-radius: 16px;
  aspect-ratio: 1/1;
  margin-inline: auto;
  transition: opacity 0.4s;
  border: 1px solid lightgray;
  &:hover {
    opacity: ${({ variant }) => variant !== "inTweet" && "0.75"};
  }
`;

const ProfileInfoContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ProfileInfoWrapper = styled.div<{
  variant?: "inTweet" | "tweetPage" | "tweetReply";
}>`
  transition: opacity 0.4s;
  &:hover {
    opacity: ${({ variant }) => variant !== "inTweet" && "0.75"};
  }
`;

const DeleteIconWrapper = styled.div`
  display: grid;
  place-items: center;
  border-radius: 50%;
  cursor: pointer;
  padding: 8px;
  transition: all 0.4s;
  &:hover {
    background-color: rgba(255, 0, 0, 0.2);
  }
  &:active {
    background-color: rgba(255, 0, 0, 0.7);
  }
  align-self: flex-start;
`;

const DeleteIcon = styled(AiOutlineDelete)`
  color: red;
`;

export const TweetWrapper = styled.div`
  margin-block: 2rem;
  @media screen and (min-width: 50em) {
    margin-top: revert;
  }
`;

const RetweetWrapper = styled.div`
  color: hsla(0, 0%, 51%, 1);
  font: 500 1.4rem var(--ff-poppins);
  line-height: 14px;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  max-width: calc(100% * 3 / 4);
  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const TweetBox = styled.div<{
  variant: "inTweet" | "tweetPage" | "tweetReply" | undefined;
}>`
  box-shadow: ${(props) =>
    props.variant === "inTweet" || props.variant === "tweetReply"
      ? "none"
      : "0px 2px 4px rgba(0, 0, 0, 0.05)"};
  border-radius: 8px;
  font-family: var(--ff-noto);
  background-color: ${({ variant }) =>
    variant === "tweetReply" ? "transparent" : "white"};
  padding: 2rem;
  cursor: ${({ variant }) => variant !== "inTweet" && "pointer"};
  transition: all 0.4s;
  &:hover {
    box-shadow: ${({ variant }) =>
      variant === "tweetReply" || variant === "inTweet"
        ? "none"
        : "0px 2px 4px 2px rgba(0, 0, 0, 0.1)"};
  }
`;

const TweetText = styled.span`
  font: 400 1.6rem var(--ff-noto);
  color: hsla(0, 0%, 31%, 1);
  margin-block: 2rem;
  display: inline-block;
`;

const TweetInfo = styled.span`
  display: flex;
  justify-content: flex-end;
  font: 500 1.2rem var(--ff-noto);
  color: hsla(0, 0%, 74%, 1);
  margin-block: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  span {
    display: inline-block;
    margin-left: 1.5rem;
  }
`;

const ImagesWrapper = styled(TweetImageArrayWrapper)`
  width: 100%;
  margin-top: revert;
`;
