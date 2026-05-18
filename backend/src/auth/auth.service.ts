import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { User, UserDocument } from './schemas/user.schema'
import { RegisterDto, LoginDto } from './dto/auth.dto'

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  // ─── Register ─────────────────────────────────────────────────
  async register(dto: RegisterDto) {
    // Check duplicate email
    const exists = await this.userModel.findOne({ email: dto.email })
    if (exists) throw new ConflictException('Email already registered')

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 12)

    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    })

    const token = this.generateToken(user)
    return { user: this.sanitizeUser(user), token }
  }

  // ─── Login ────────────────────────────────────────────────────
  async login(dto: LoginDto) {
    // Find user (include password for comparison)
    const user = await this.userModel.findOne({ email: dto.email }).select('+password')
    if (!user) throw new UnauthorizedException('Invalid email or password')

    // Compare password
    const isMatch = await bcrypt.compare(dto.password, user.password)
    if (!isMatch) throw new UnauthorizedException('Invalid email or password')

    const token = this.generateToken(user)
    return { user: this.sanitizeUser(user), token }
  }

  // ─── Get profile ──────────────────────────────────────────────
  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId)
    if (!user) throw new NotFoundException('User not found')
    return this.sanitizeUser(user)
  }

  // ─── Helpers ──────────────────────────────────────────────────
  private generateToken(user: UserDocument): string {
    return this.jwtService.sign({
      sub: user._id,
      email: user.email,
      role: user.role,
    })
  }

  private sanitizeUser(user: UserDocument) {
    const obj = user.toObject()
    delete obj.password
    return obj
  }
}
