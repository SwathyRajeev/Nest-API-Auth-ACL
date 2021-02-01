// For delete row(s) from DB
export function deleteString(entity: string, affected: number) {
  if (affected === 1) {
    return affected + ' ' + entity + ' Removed';
  } else if (affected > 1) {
    return affected + ' ' + entity + 's Removed';
  }
}


export const PROFILE_IMAGE_PATH = 'uploads/profile';
