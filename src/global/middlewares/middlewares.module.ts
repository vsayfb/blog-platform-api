import { Global, Module } from '@nestjs/common';
import { PostsModule } from 'src/posts/posts.module';
import { IsPostFoundByIdParam } from './is-post-found';

@Global()
@Module({
  imports: [PostsModule],
  providers: [IsPostFoundByIdParam],
  exports: [IsPostFoundByIdParam],
})
export class GuardsModule {}
