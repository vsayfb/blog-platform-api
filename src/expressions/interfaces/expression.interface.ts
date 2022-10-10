export interface IExpressionsController {
  findLikes(subjectID: string): Promise<any>;
  findDislikes(subjectID: string): Promise<any>;
  like(...data: any[]): Promise<any>;
  dislike(...data: any[]): Promise<any>;
}
