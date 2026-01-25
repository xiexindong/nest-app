import { IsString, IsNumber, IsOptional, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateItemDto {
  @ApiProperty({ description: '商品名称', example: 'Apple iPhone 15' })
  @IsString({ message: '名称必须是字符串' })
  @MaxLength(100, { message: '名称长度不能超过100个字符' })
  name: string;

  @ApiProperty({ description: '商品描述', example: 'Latest iPhone model', required: false })
  @IsOptional()
  @IsString({ message: '描述必须是字符串' })
  @MaxLength(500, { message: '描述长度不能超过500个字符' })
  description: string;

  @ApiProperty({ description: '商品价格', example: 999.99 })
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: '价格必须是数字' })
  @Min(0, { message: '价格不能为负数' })
  price: number;

  @ApiProperty({ description: '商品数量', example: 100 })
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: '数量必须是数字' })
  @Min(0, { message: '数量不能为负数' })
  quantity: number;
}
