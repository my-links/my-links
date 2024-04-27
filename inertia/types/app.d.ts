import { Serialize } from '@tuyau/utils/types';
import type UserModel from '../../app/models/user';

type User = Serialize<UserModel>;
