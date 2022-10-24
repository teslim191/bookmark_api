import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private readonly prismaService: PrismaService) {}
  async getBookmarks(userId: number) {
    const bookmarks = await this.prismaService.bookmark.findMany({
      where: {
        userId,
      },
    });
    return bookmarks;
  }

  async createBookmark(userId: number, dto: CreateBookmarkDto) {
    const bookmark = await this.prismaService.bookmark.create({
      data: {
        title: dto.title,
        description: dto.description,
        link: dto.link,
        userId,
      },
    });
    return bookmark;
  }

  async getBookmarkById(userId: number, bookmarkId: number) {
    try {
      const bookmark = await this.prismaService.bookmark.findFirst({
        where: {
          id: bookmarkId,
          userId,
        },
      });
      if (!bookmark) {
        throw new ForbiddenException('bookmark does not exist');
      }
      return bookmark;
    } catch (error) {
      throw error;
    }
  }

  async editBookmarkById(
    userId: number,
    bookmarkId: number,
    dto: EditBookmarkDto,
  ) {
    // check if bookmark exists
    let bookmark = await this.prismaService.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });
    // throw exception if bookmark does not exist
    if (!bookmark) {
      throw new ForbiddenException('Bookmark does not exist');
    }
    // if bookmark does not belong to logged in user
    else if (bookmark.userId !== userId) {
      throw new ForbiddenException('You are not authorized to do that');
    } else {
      bookmark = await this.prismaService.bookmark.update({
        where: {
          id: bookmarkId,
        },
        data: {
          ...dto,
        },
      });

      return bookmark;
    }
  }

  async deleteBookmarkById(userId: number, bookmarkId: number) {
    // check if bookmark exist
    let bookmark = await this.prismaService.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });
    // if bookmark does not exist
    if (!bookmark) {
      throw new ForbiddenException('Bookmark does not exist');
    }
    // if bookmark exists but does not belong to the logged in user
    else if (bookmark.userId !== userId) {
      throw new ForbiddenException('You are not authorized to do that');
    } else {
      bookmark = await this.prismaService.bookmark.delete({
        where: {
          id: bookmarkId,
        },
      });
    }
  }
}
