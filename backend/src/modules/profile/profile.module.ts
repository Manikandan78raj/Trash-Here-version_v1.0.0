import { Module } from "@nestjs/common";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";
import { CloudinaryProvider } from "../../common/providers/storage/cloudinary.provider";
import { LocalStorageProvider } from "../../common/providers/storage/local-storage.provider";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [ProfileController],
  providers: [ProfileService, CloudinaryProvider, LocalStorageProvider],
  exports: [ProfileService],
})
export class ProfileModule {}
