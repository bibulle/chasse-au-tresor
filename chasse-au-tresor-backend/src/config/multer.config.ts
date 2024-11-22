import { ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import * as path from 'path';
import { join } from 'path';

export const multerOptionsFactory = (configService: ConfigService) => ({
  storage: diskStorage({
    destination: join(
      configService.get<string>('BASE_PATH'),
      configService.get<string>('UPLOAD_PATH'),
    ),
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Seules les images sont autorisées !'), false);
    }
    cb(null, true);
  },
});
