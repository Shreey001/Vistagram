import { CommunityDisplay } from "../components/CommunityDisplay";
import { useParams } from "react-router";

export const CommunityPage = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="max-w-5xl mx-auto">
      <CommunityDisplay communityId={Number(id)} />
    </div>
  );
};
