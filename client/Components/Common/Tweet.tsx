import Image from "next/image";
import { AiOutlineDelete, AiOutlineRetweet } from "react-icons/ai";
import styled from "styled-components";
import ProfileInfo from "./ProfileInfo";
import TweetOptions from "./TweetOptions";
import TweetReplies from "./TweetReplies";
import CreateTweet, { TweetImageArrayWrapper } from "./CreateTweet";
import { useState } from "react";
import {
  CancelButton,
  DiscardButton,
  SubToastMessage,
  ToastMessage,
} from "../../styles/Toast.styles";
import toast from "react-hot-toast";
import {
  useCreateCommentMutation,
  useDeleteTweetMutation,
} from "../../app/services/api";

const Tweet = (props: TweetProps) => {
  const [message, setMessage] = useState<string>("");
  const [fileList, setFileList] = useState<Array<{ id: string; file: File }>>(
    []
  );
  const [isCommentButtonClicked, setIsCommentButtonClicked] = useState(false);
  const [deleteTweet] = useDeleteTweetMutation();
  const [createComment] = useCreateCommentMutation();

  const onSubmit = async (e: React.FormEvent, tweetId: string) => {
    e.preventDefault();
    const fileArray = fileList.map((item) => item.file);
    setFileList([]);
    setMessage("");
    const formData = new FormData();
    formData.append("comment", message);
    formData.append("tweetId", tweetId);
    for (let i = 0; i < fileList.length; i++) {
      formData.append("media", fileArray[i]);
    }
    try {
      await createComment(formData).unwrap();
      toast.success(() => (
        <ToastMessage>Created Comment Successfully</ToastMessage>
      ));
    } catch (error) {
      toast.error(() => <ToastMessage>Error in Creating Comment</ToastMessage>);
    }
  };

  const onDeleteButtonClick = (tweetId: string) => {
    toast.dismiss();
    toast(
      (t) => (
        <span>
          <ToastMessage>Delete Tweet?</ToastMessage>
          <SubToastMessage>
            This can’t be undone and it will be removed from your profile, the
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
    <TweetWrapper>
      <RetweetWrapper>
        <AiOutlineRetweet size={14} />
        {/* To be Conditionally Rendered */}
        <span>{props.authorName} Retweeted</span>
      </RetweetWrapper>
      <TweetBox>
        <ProfileInfoWrapper>
          <ProfileInfo
            name={props.authorName}
            followerCount={props.authorFollowers}
            profilePic={props.authorProfilePic}
          />
          <DeleteIconWrapper onClick={() => onDeleteButtonClick(props.tweetId)}>
            <DeleteIcon size={24} />
          </DeleteIconWrapper>
        </ProfileInfoWrapper>
        <TweetText>{props.authorTweet}</TweetText>
        <ImageWrapper numOfImages={props.mediaList.length}>
          {props.mediaList.map((mediaItemUrl, index) => (
            <TweetImage
              key={`${mediaItemUrl} ${index}`}
              src={mediaItemUrl}
              layout="responsive"
              width={100}
              height={30}
            />
          ))}
        </ImageWrapper>
        <TweetInfo>
          <span>449 Comments</span>
          <span>59K Retweets</span>
          <span>234 Saved</span>
        </TweetInfo>
        <TweetOptions setIsCommentButtonClicked={setIsCommentButtonClicked} />
        {isCommentButtonClicked && (
          <CreateTweet
            isReplyImageVisible={true}
            placeholder="Tweet your reply"
            btnText="Reply"
            message={message}
            setMessage={setMessage}
            fileList={fileList}
            setFileList={setFileList}
            onSubmit={(e) => onSubmit(e, props.tweetId)}
            replyImageUrl={props.authorProfilePic}
          />
        )}
        {/* Fetch data after comment clicked */}
        {isCommentButtonClicked &&
          Array.from(Array(10).keys()).map((index) => (
            <div key={index}>
              <TweetReplies />
            </div>
          ))}
      </TweetBox>
    </TweetWrapper>
  );
};
export default Tweet;

const ProfileInfoWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const DeleteIconWrapper = styled.div`
  display: grid;
  place-items: center;
  border-radius: 50%;
  cursor: pointer;
  padding: 8px;
  transition: all 0.4s;
  &:hover {
    background-color: rgba(130, 130, 130, 0.2);
  }
  &:active {
    background-color: rgba(130, 130, 130, 0.7);
  }
  align-self: flex-start;
`;

const DeleteIcon = styled(AiOutlineDelete)`
  color: red;
`;

export const TweetWrapper = styled.div`
  margin-block: 2rem;
  @media screen and (min-width: 40em) {
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
`;

export const TweetBox = styled.div`
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  font-family: var(--ff-noto);
  background-color: white;
  padding: 2rem;
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
  span {
    display: inline-block;
    margin-left: 1.5rem;
  }
`;

const ImageWrapper = styled(TweetImageArrayWrapper)`
  width: 100%;
  margin-top: revert;
`;

const TweetImage = styled(Image)`
  border-radius: 6px;
`;
