import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { Services, SPACES_URL } from '../../../utils/types';
import { ImageServiceInterface } from '../../services/images/image';
import { v4 as uuidv4 } from 'uuid';
import { ImageOptionsDto } from '../../utils/dto/ImageOptionsDto';
import { ImageDTOValidationPipe } from '../../utils/pipes/ImageDTOValidationPipe';

@Controller('image')
export class ImageController {
  constructor(
    @Inject(Services.IMAGE)
    private readonly imageService: ImageServiceInterface,
  ) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(new ValidationPipe({ transform: true }), ImageDTOValidationPipe)
  async createImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() imageOptions: ImageOptionsDto,
    @Res() res: Response,
  ) {
    console.log(imageOptions);
    try {
      const key = uuidv4().split('-')[0];
      const upload = await this.imageService.upload(key, file, imageOptions);
      res.status(201).send(key);
    } catch (err) {
      console.log(err);
      res.send(500);
    }
  }

  @Get(':key')
  async getImage(@Param('key') key: string, @Res() res: Response) {
    console.log(key);
    try {
      await this.imageService.read(key);
      res.send(`${SPACES_URL}/${key}`);
    } catch (err) {
      console.log(err);
      res.send(400);
    }
  }
}
