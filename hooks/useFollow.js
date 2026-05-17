import { useState, useEffect, useCallback } from "react";
import { followUser, unfollowUser, isFollowing } from "../services/followService";

/**
 * Hook para gerenciar o estado de seguir/deixar de seguir um usuário
 */
export const useFollow = (targetUserId, targetUserData) => {
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verificar status inicial de follow
  useEffect(() => {
    const checkFollowing = async () => {
      try {
        const following = await isFollowing(targetUserId);
        setIsFollowingUser(following);
      } catch (err) {
        console.log("Erro ao verificar follow:", err);
        setError(err.message);
      }
    };

    checkFollowing();
  }, [targetUserId]);

  // Toggle follow/unfollow
  const toggleFollow = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isFollowingUser) {
        await unfollowUser(targetUserId);
        setIsFollowingUser(false);
      } else {
        await followUser(targetUserId, targetUserData);
        setIsFollowingUser(true);
      }
    } catch (err) {
      console.log("Erro ao togglear follow:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isFollowingUser, targetUserId, targetUserData]);

  return {
    isFollowing: isFollowingUser,
    loading,
    error,
    toggleFollow,
  };
};
