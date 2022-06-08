import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { Client } from 'pg';

@Injectable()
export class DatabaseService {
  private db: Client;

  constructor(configService: ConfigService) {
    this.db = new Client({
      connectionString: configService.get<string>('DEV_DATABASE'),
    });

    this.db.connect();
  }

  async dropTable(table: string) {
    await this.db.query(`DROP TABLE ${table}`);
    return this.db.end();
  }
}
