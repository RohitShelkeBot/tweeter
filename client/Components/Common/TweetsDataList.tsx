import { useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import styled from "styled-components";
import { ScrollerMessage } from "../../pages/profile/[userId]";
import { Loader } from "./FullScreenLoader";
import NoTweetsToShow from "./NoTweetsToShow";
import Tweet from "./Tweet";

const TweetsDataList = ({
  TweetsData,
  getMoreTweets,
  hasMoreTweets,
  setHasMoreTweets,
  variant,
}: TweetsDataListProps) => {
  useEffect(() => {
    if (TweetsData.data.length === 10) setHasMoreTweets(true);
  }, [TweetsData]);

  return (
    <InfiniteScroll
      dataLength={TweetsData.data.length}
      next={getMoreTweets}
      hasMore={hasMoreTweets}
      loader={<ScrollerMessage>Loading...</ScrollerMessage>}
    >
      {TweetsData.data.length === 0 ? (
        <NoTweetsToShow message="No Tweets To Show !" />
      ) : (
        TweetsData.data.map((tweet, key) => (
          <>
            {variant === "tweetReply" && key !== 0 && <TweetSeparator />}
            <Tweet
              key={tweet._id}
              authorName={tweet.creator[0].name}
              authorId={tweet.creator[0]._id}
              authorUserName={tweet.creator[0].username}
              authorFollowers={6969} //Change
              authorProfilePic={tweet.creator[0].profilePic}
              mediaList={tweet.media}
              authorTweet={tweet.tweet}
              tweetId={tweet._id}
              tweetCreationDate={tweet.createdAt}
              isSaved={tweet.saved.length === 0 ? false : true}
              isLiked={
                tweet.liked !== undefined && tweet.liked.length === 0
                  ? false
                  : true
              }
              isRetweeted={tweet.retweeted.length === 0 ? false : true}
              commentCount={tweet.commentCount[0]}
              likes={tweet.likes}
              retweetedUsers={tweet.retweetedUsers}
              savedBy={tweet.savedBy}
              variant={variant}
            />
          </>
        ))
      )}
    </InfiniteScroll>
  );
};
export default TweetsDataList;

const TweetSeparator = styled.hr`
  border: 1px solid hsla(0, 0%, 90%, 1);
  margin-bottom: 2rem;
`;
