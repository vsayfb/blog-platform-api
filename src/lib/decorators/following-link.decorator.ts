import { SetMetadata } from '@nestjs/common';

/**
 *
 * This decorator specifies that an additional request must be made to a different route to complete process.
 *
 * @param followingURL
 *
 */
export const FollowingURL = (followingURL: string) =>
  SetMetadata('followingURL', followingURL);
