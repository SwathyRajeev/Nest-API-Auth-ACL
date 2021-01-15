
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class PhotoDto {
    
    @ApiProperty()
    @IsNotEmpty()
    photo: string;

}
