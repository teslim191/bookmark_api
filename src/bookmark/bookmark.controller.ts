import { Controller, HttpStatus, ParseIntPipe } from '@nestjs/common';
import {
  Body,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common/decorators';
import { getUser } from '../auth/decorators';
import { Jwt } from '../auth/guard';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@UseGuards(Jwt)
@Controller('bookmarks')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Get()
  getBookmarks(@getUser('id') userId: number) {
    return this.bookmarkService.getBookmarks(userId);
  }

  @Post()
  createBookmark(
    @getUser('id') userId: number,
    @Body() dto: CreateBookmarkDto,
  ) {
    return this.bookmarkService.createBookmark(userId, dto);
  }

  @Get(':id')
  getBookmarkById(
    @getUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    return this.bookmarkService.getBookmarkById(userId, bookmarkId);
  }

  @Patch(':id')
  editBookmarkById(
    @getUser('id') userId: number,
    @Body() dto: EditBookmarkDto,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    return this.bookmarkService.editBookmarkById(userId, bookmarkId, dto);
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteBookmarkById(
    @getUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkid: number,
  ) {
    return this.bookmarkService.deleteBookmarkById(userId, bookmarkid);
  }
}
