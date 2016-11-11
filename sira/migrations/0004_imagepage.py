# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2016-11-05 16:38
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('wagtailcore', '0030_auto_20161023_1338'),
        ('sira', '0003_videopage'),
    ]

    operations = [
        migrations.CreateModel(
            name='ImagePage',
            fields=[
                ('page_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='wagtailcore.Page')),
            ],
            options={
                'verbose_name': 'Images',
            },
            bases=('wagtailcore.page',),
        ),
    ]
