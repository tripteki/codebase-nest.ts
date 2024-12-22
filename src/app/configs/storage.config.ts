"use strict";

import { registerAs, } from "@nestjs/config";
import { join, } from "path";

export default registerAs ("storage", () => ({

    /**
     * -----------------------------------------------------
     * Disks Configuration
     * -----------------------------------------------------
     *
     * This configuration defines the available storage disks
     * for the application. The disks represent different
     * locations where files can be stored (e.g., local filesystem,
     * cloud storage services like S3, GCS).
     */
    disks: {

        /**
         * -----------------------------------------------------
         * Private Disk
         * -----------------------------------------------------
         *
         * Specifies the local path where files for the "private"
         * disk will be stored. This is typically used for storing
         * sensitive or private files that should not be publicly
         * accessible.
         */
        private: {

            path: join (__dirname, "../../../", "storage/disks/private/"),
        },

        /**
         * -----------------------------------------------------
         * Public Disk
         * -----------------------------------------------------
         *
         * Specifies the local path where files for the "public"
         * disk will be stored. This is typically used for files
         * that should be publicly accessible (e.g., images, documents).
         * Like the private disk, the `path` is dynamically constructed
         * to ensure cross-platform compatibility.
         */
        public: {

            path: join (__dirname, "../../../", "storage/disks/public/"),
        },

        /**
         * -----------------------------------------------------
         * S3 Disk
         * -----------------------------------------------------
         *
         * Configurations for Amazon S3 (Simple Storage Service)
         * can be added here. S3 is a cloud storage service provided
         * by AWS (Amazon Web Services), and this disk would represent
         * the configuration for storing files on S3.
         * The S3 disk configuration is left empty here, but it could
         * include information like access keys, bucket name, and region.
         */
        s3: {

            url: process.env.AWS_URL,
            endpoint: process.env.AWS_ENDPOINT,
            use_path_style_endpoint: Boolean (process.env.AWS_USE_PATH_STYLE_ENDPOINT || false),
            key: process.env.AWS_ACCESS_KEY_ID,
            secret: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_DEFAULT_REGION,
            bucket: process.env.AWS_BUCKET,
            throw: false,
        },

        /**
         * -----------------------------------------------------
         * GCS Disk
         * -----------------------------------------------------
         *
         * Configurations for Google Cloud Storage can be added here.
         * GCS is a cloud storage service from Google, and this disk would
         * represent the configuration for storing files in GCS buckets.
         * Similar to the S3 configuration, it's currently empty, but could
         * include settings like bucket name, credentials, etc.
         */
        gcs: {

            path_prefix: process.env.GCP_PATH || "",
            api_endpoint: process.env.GCP_API_ENDPOINT || null,
            storage_api_uri: process.env.GCP_STORAGE_API_ENDPOINT || null,
            key_file_path: process.env.GCP_KEY_FILE_PATH || null,
            key_file: JSON.parse (process.env.GCP_KEY_FILE || "{}"),
            project_id: process.env.GCP_PROJECT_ID,
            bucket: process.env.GCP_BUCKET,
            throw: false,
        },
    },

}));
