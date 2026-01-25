import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ItemService } from './item.service.js';
import { CreateItemDto, UpdateItemDto } from './dto/index.js';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('items')
@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @ApiOperation({ summary: '创建新商品' })
  @ApiResponse({ status: 201, description: '商品创建成功' })
  @ApiResponse({ status: 400, description: '请求数据验证失败' })
  @Post()
  create(@Body() createItemDto: CreateItemDto) {
    return this.itemService.create(createItemDto);
  }

  @ApiOperation({ summary: '获取所有商品' })
  @ApiResponse({ status: 200, description: '获取商品列表成功' })
  @Get()
  findAll() {
    return this.itemService.findAll();
  }

  @ApiOperation({ summary: '根据ID获取商品' })
  @ApiParam({ name: 'id', description: '商品ID' })
  @ApiResponse({ status: 200, description: '获取商品成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.itemService.findOne(id);
  }

  @ApiOperation({ summary: '更新商品信息' })
  @ApiParam({ name: 'id', description: '商品ID' })
  @ApiResponse({ status: 200, description: '商品更新成功' })
  @ApiResponse({ status: 400, description: '请求数据验证失败' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    return this.itemService.update(id, updateItemDto);
  }

  @ApiOperation({ summary: '删除商品' })
  @ApiParam({ name: 'id', description: '商品ID' })
  @ApiResponse({ status: 200, description: '商品删除成功' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.itemService.remove(id);
  }
}
